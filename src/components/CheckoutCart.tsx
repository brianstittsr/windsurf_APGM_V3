'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../lib/stripe';
import MultiPaymentForm, { PaymentMethod } from './MultiPaymentForm';
import StripeModeIndicator from './StripeModeIndicator';
import CouponInput from './CouponInput';
import GiftCardInput from './GiftCardInput';
import { calculateTotalWithStripeFees, formatCurrency, getStripeFeeExplanation } from '../lib/stripe-fees';
import { calculateTotalWithStripeFeesSync } from '../lib/stripe-fees-sync';
import { BusinessSettingsService } from '@/services/businessSettingsService';
import { CouponCode, GiftCard } from '@/types/database';
import { ActivityService } from '@/services/activityService';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
}

interface CheckoutData {
  selectedDate: string;
  selectedTime: string;
  paymentMethod: string;
  specialRequests: string;
  giftCard: string;
  agreeToTerms: boolean;
  agreeToPolicy: boolean;
}

interface CheckoutCartProps {
  service: ServiceItem;
  appointmentDate: string;
  appointmentTime: string;
  clientName: string;
  clientId?: string;
  data: CheckoutData;
  onChange: (data: CheckoutData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CheckoutCart({ 
  service, 
  appointmentDate, 
  appointmentTime, 
  clientName,
  clientId,
  data, 
  onChange, 
  onNext, 
  onBack 
}: CheckoutCartProps) {
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [feeCalculation, setFeeCalculation] = useState<any>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const handleInputChange = (field: keyof CheckoutData, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleCouponApplied = (coupon: CouponCode | null, discount: number) => {
    setAppliedCoupon(coupon);
    setCouponDiscount(discount);
  };

  const handleGiftCardApplied = (giftCard: GiftCard | null, appliedAmount: number) => {
    setAppliedGiftCard(giftCard);
    setGiftCardDiscount(appliedAmount);
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    setPaymentSuccess(true);
    setPaymentError(null);
    setShowPaymentForm(false);
    
    try {
      // 1. Create appointment in Firebase
      console.log('📅 Creating appointment in Firebase...');
      
      // Determine if this is a full payment or deposit based on payment method and total amount
      const isPayLaterMethod = paymentIntent.payment_method_types?.includes('klarna') || 
                              paymentIntent.payment_method_types?.includes('affirm') || 
                              paymentIntent.payment_method_types?.includes('cherry') ||
                              paymentIntent.id === 'cherry_redirect';
      
      // Check if total is under $200 threshold for full payment requirement
      const totalWithTax = subtotal + tax;
      const requiresFullPaymentDueToAmount = totalWithTax < 200;
      
      const isFullPayment = isPayLaterMethod || requiresFullPaymentDueToAmount;
      
      const appointmentData = {
        clientId: clientId || 'temp-client-id',
        clientName: clientName,
        clientEmail: 'brianstittsr@gmail.com', // Using your email as requested
        serviceId: service.id,
        serviceName: service.name,
        artistId: 'victoria', // Default artist - should be dynamic based on selection
        scheduledDate: appointmentDate,
        scheduledTime: appointmentTime,
        status: 'confirmed' as const,
        paymentStatus: isFullPayment ? 'paid_in_full' as const : 'deposit_paid' as const,
        totalAmount: totalAmount,
        depositAmount: isFullPayment ? totalAmount : depositAmount + stripeFee,
        remainingAmount: isFullPayment ? 0 : remainingAmount,
        paymentIntentId: paymentIntent.id,
        specialRequests: data.specialRequests || '',
        giftCardCode: appliedGiftCard?.code || undefined,
        giftCardAmount: giftCardDiscount > 0 ? giftCardDiscount * 100 : undefined, // Store in cents
        ...(appliedCoupon && { couponCode: appliedCoupon.code }),
        ...(couponDiscount > 0 && { couponDiscount }),
        ...(giftCardDiscount > 0 && { giftCardDiscount }),
        rescheduleCount: 0,
        confirmationSent: false,
        reminderSent: false
      };

      // Import the services we need
      const { AppointmentService, AvailabilityService } = await import('@/services/database');
      
      const appointmentId = await AppointmentService.createAppointment(appointmentData);
      console.log('✅ Appointment created:', appointmentId);

      // Log payment activity
      try {
        const paymentMethod = paymentIntent.payment_method_types?.[0] || 'card';
        const paidAmount = isFullPayment ? totalAmount : depositAmount + stripeFee;
        
        await ActivityService.logPaymentActivity(
          clientId || 'temp-client-id',
          paymentMethod,
          paidAmount,
          appointmentId
        );
        console.log('✅ Payment activity logged');
      } catch (activityError) {
        console.error('Failed to log payment activity:', activityError);
      }

      // 2. Remove availability for the booked time slot
      console.log('🚫 Removing availability for booked time slot...');
      try {
        const { AvailabilityService: NewAvailabilityService } = await import('@/services/availabilityService');
        await NewAvailabilityService.bookTimeSlot('victoria', appointmentDate, appointmentTime, appointmentId);
        console.log('✅ Time slot marked as unavailable');
      } catch (availabilityError) {
        console.warn('⚠️ Could not update availability (document may not exist):', availabilityError);
        // Don't fail the entire booking process for availability update issues
      }

      // 3. Apply coupon usage if one was used
      if (appliedCoupon) {
        console.log('🎫 Applying coupon usage...');
        const { CouponService } = await import('@/services/couponService');
        await CouponService.applyCoupon(appliedCoupon.id);
        console.log('✅ Coupon usage applied');
      }

      // 4. Process gift card usage if one was applied
      if (appliedGiftCard && giftCardDiscount > 0) {
        console.log('🎁 Processing gift card usage...');
        try {
          const { GiftCardService } = await import('@/services/giftCardService');
          await GiftCardService.useGiftCard(appliedGiftCard.id, giftCardDiscount * 100); // Convert to cents
          console.log('✅ Gift card usage processed');
        } catch (giftCardError) {
          console.warn('⚠️ Could not process gift card usage:', giftCardError);
          // Don't fail the entire booking process for gift card issues
        }
      }

      // 4. Send invoice email
      console.log('📧 Sending invoice email...');
      
      const invoiceData = {
        invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        clientName: clientName,
        clientEmail: 'brianstittsr@gmail.com',
        serviceName: service.name,
        servicePrice: service.price,
        couponCode: appliedCoupon?.code,
        couponDiscount: couponDiscount,
        giftCardCode: appliedGiftCard?.code,
        giftCardDiscount: giftCardDiscount,
        discountedPrice: subtotal,
        tax: tax,
        processingFee: stripeFee,
        total: totalAmount,
        depositPaid: depositAmount + stripeFee,
        remainingBalance: remainingAmount,
        appointmentDate: new Date(appointmentDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointmentTime: appointmentTime,
        businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'A Pretty Girl Matter',
        businessPhone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(919) 441-0932',
        businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'victoria@aprettygirlmatter.com',
        businessAddress: '123 Beauty Lane, Raleigh, NC 27601',
        paymentIntentId: paymentIntent.id,
        appointmentId: appointmentId
      };
      
      const invoiceResponse = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
      
      if (invoiceResponse.ok) {
        console.log('✅ Invoice email sent successfully!');
      } else {
        console.log('⚠️ Invoice email failed to send, but payment was successful');
      }

      // 5. Generate payment confirmation PDF
      console.log('📄 Generating payment confirmation PDF...');
      
      const paymentPDFData = {
        clientName: clientName,
        clientEmail: 'brianstittsr@gmail.com',
        amount: depositAmount,
        paymentMethod: 'Credit/Debit Card',
        transactionId: paymentIntent.id,
        appointmentDate: new Date(appointmentDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        serviceName: service.name
      };

      const pdfResponse = await fetch('/api/generate-payment-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData: paymentPDFData,
          clientId: 'brianstittsr@gmail.com', // Using email as clientId for now
          appointmentId: appointmentId
        }),
      });
      
      if (pdfResponse.ok) {
        const pdfResult = await pdfResponse.json();
        console.log('✅ Payment confirmation PDF generated successfully!');
        console.log('📄 PDF URL:', pdfResult.pdfUrl);
      } else {
        console.log('⚠️ Payment PDF generation failed, but payment was successful');
      }

    } catch (error) {
      console.error('Error in post-payment processing:', error);
      // Don't fail the payment flow, but log the error
      console.log('⚠️ Payment succeeded but there was an issue with booking creation or availability update');
    }
    
    // Call onNext to proceed to confirmation
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  const handleAddPaymentMethod = () => {
    setPaymentError(null);
    setShowPaymentForm(true);
  };

  // Load business settings and calculate fees
  useEffect(() => {
    const loadFeeCalculation = async () => {
      try {
        const totalDiscounts = couponDiscount + giftCardDiscount;
        const discountedServicePrice = Math.max(0, service.price - totalDiscounts);
        
        const calculation = await calculateTotalWithStripeFees(
          discountedServicePrice,
          undefined, // Use settings tax rate
          undefined, // Use settings deposit percentage
          selectedPaymentMethod
        );
        
        setFeeCalculation(calculation);
        setSettingsLoaded(true);
      } catch (error) {
        console.error('Error calculating fees:', error);
        // Fallback to sync calculation with defaults
        const totalDiscounts = couponDiscount + giftCardDiscount;
        const discountedServicePrice = Math.max(0, service.price - totalDiscounts);
        const fallbackCalculation = calculateTotalWithStripeFeesSync(
          discountedServicePrice,
          0.0775, // Default tax rate
          undefined, // Will use 33.33% default
          selectedPaymentMethod
        );
        setFeeCalculation(fallbackCalculation);
        setSettingsLoaded(true);
      }
    };
    
    loadFeeCalculation();
  }, [service.price, couponDiscount, giftCardDiscount, selectedPaymentMethod]);
  
  // Use calculated values or defaults while loading
  const subtotal = feeCalculation?.subtotal || 0;
  const tax = feeCalculation?.tax || 0;
  const stripeFee = feeCalculation?.stripeFee || 0;
  const totalAmount = feeCalculation?.total || 0;
  const depositAmount = feeCalculation?.deposit || 0;
  const remainingAmount = feeCalculation?.remaining || 0;
  
  // Show loading state if settings not loaded
  if (!settingsLoaded || !feeCalculation) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Calculating pricing...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Modern Header Section */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{width: '80px', height: '80px'}}>
              <i className="fas fa-calendar-check text-primary" style={{fontSize: '2rem'}}></i>
            </div>
            <h1 className="h2 fw-bold mb-2">Complete Your Booking</h1>
            <p className="text-muted lead">Welcome back, Brian S</p>
            <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
              <i className="fas fa-sparkles me-2"></i>
              A Pretty Girl Matter
            </div>
          </div>

          {/* Stripe Mode Indicator - Hidden in production */}
          {/* <div className="mb-4">
            <StripeModeIndicator />
          </div> */}

          {/* Modern Client Card */}
          <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '16px'}}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="card-title mb-0 fw-bold">
                  <i className="fas fa-user-circle text-primary me-2"></i>
                  Booking Details
                </h5>
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                  <i className="fas fa-check-circle me-1"></i>
                  Verified Client
                </span>
              </div>
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '56px', height: '56px'}}>
                    <i className="fas fa-user" style={{fontSize: '1.5rem'}}></i>
                  </div>
                </div>
                <div className="col">
                  <h6 className="mb-1 fw-bold">Brian Stitt</h6>
                  <p className="text-muted mb-0 small">Primary Account Holder</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Appointment Details */}
          <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '16px'}}>
            <div className="card-body p-4">
              <h5 className="card-title mb-4 fw-bold">
                <i className="fas fa-comment-dots text-primary me-2"></i>
                Special Requests
              </h5>
              <div className="form-floating">
                <textarea
                  className="form-control"
                  id="specialRequests"
                  rows={4}
                  value={data.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Share any special requests, ideas, or preferences with your artist..."
                  style={{minHeight: '120px', borderRadius: '12px'}}
                />
                <label htmlFor="specialRequests" className="text-muted">
                  <i className="fas fa-pencil-alt me-1"></i>
                  Tell us about your vision (optional)
                </label>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <i className="fas fa-lightbulb me-1"></i>
                  This helps your artist prepare and customize your experience
                </small>
              </div>
            </div>
          </div>

          {/* Gift Card Section */}
          <GiftCardInput
            orderAmount={service.price}
            onGiftCardApplied={handleGiftCardApplied}
            appliedGiftCard={appliedGiftCard}
            appliedAmount={giftCardDiscount}
          />

          {/* Coupon Code Section */}
          <CouponInput
            serviceId={service.id}
            orderAmount={service.price}
            onCouponApplied={handleCouponApplied}
            appliedCoupon={appliedCoupon}
          />

          {/* Modern Payment Section */}
          <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '16px'}}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                  <i className="fas fa-credit-card" style={{fontSize: '1.25rem'}}></i>
                </div>
                <div>
                  <h5 className="card-title mb-1 fw-bold">Secure Payment Required</h5>
                  <p className="text-muted mb-0 small">Deposit secures your appointment slot</p>
                </div>
              </div>
              
              <div className="alert alert-info border-0" style={{backgroundColor: '#f8f9fa', borderRadius: '12px'}}>
                <div className="d-flex align-items-start">
                  <i className="fas fa-info-circle text-primary me-2 mt-1"></i>
                  <div>
                    <small className="fw-medium">Payment Policy</small>
                    <p className="mb-0 small text-muted">
                      A secure deposit is required to confirm your booking. The remaining balance will be due at your appointment.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Payment Success Message */}
              {paymentSuccess && (
                <div className="alert alert-success border-0 d-flex align-items-center" style={{borderRadius: '12px'}} role="alert">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                    <i className="fas fa-check" style={{fontSize: '1.1rem'}}></i>
                  </div>
                  <div>
                    <div className="fw-bold">Payment Successful!</div>
                    <small className="text-muted">Redirecting to confirmation...</small>
                  </div>
                </div>
              )}
              
              {/* Payment Error Message */}
              {paymentError && (
                <div className="alert alert-danger border-0 d-flex align-items-center" style={{borderRadius: '12px'}} role="alert">
                  <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                    <i className="fas fa-exclamation-triangle" style={{fontSize: '1.1rem'}}></i>
                  </div>
                  <div>
                    <div className="fw-bold">Payment Error</div>
                    <small className="text-muted">{paymentError}</small>
                  </div>
                </div>
              )}
              
              {!paymentSuccess && (
                <div className="mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="mb-0 fw-bold">Choose Payment Method</h6>
                    <div className="d-flex gap-2">
                      <i className="fab fa-cc-visa text-muted"></i>
                      <i className="fab fa-cc-mastercard text-muted"></i>
                      <i className="fab fa-cc-amex text-muted"></i>
                      <i className="fas fa-lock text-success" title="Secure Payment"></i>
                    </div>
                  </div>
                  <Elements stripe={stripePromise}>
                    <MultiPaymentForm
                      amount={depositAmount + stripeFee}
                      totalAmount={totalAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      loading={paymentLoading}
                      setLoading={setPaymentLoading}
                      onPaymentMethodChange={handlePaymentMethodChange}
                    />
                  </Elements>
                </div>
              )}
            </div>
          </div>

          {/* Modern Policy Card */}
          <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '16px'}}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                  <i className="fas fa-file-contract" style={{fontSize: '1.25rem'}}></i>
                </div>
                <div>
                  <h5 className="card-title mb-1 fw-bold">Important Policies</h5>
                  <p className="text-muted mb-0 small">Please review before completing payment</p>
                </div>
              </div>
              
              <div className="bg-light p-3 rounded-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <i className="fas fa-clock text-warning me-2 mt-1"></i>
                      <div>
                        <small className="fw-bold d-block">Punctuality</small>
                        <small className="text-muted">15-minute grace period for appointments over 1 hour</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <i className="fas fa-calendar-times text-danger me-2 mt-1"></i>
                      <div>
                        <small className="fw-bold d-block">Rescheduling</small>
                        <small className="text-muted">$50 fee for late arrivals, one reschedule allowed</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-start">
                      <i className="fas fa-ban text-primary me-2 mt-1"></i>
                      <div>
                        <small className="fw-bold d-block">Deposit Policy</small>
                        <small className="text-muted">All deposits are non-refundable and applied to your service</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Action Buttons */}
          <div className="d-flex justify-content-between align-items-center mb-5">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2 rounded-pill"
              onClick={onBack}
              disabled={paymentLoading}
              style={{minWidth: '120px'}}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </button>
            <div className="text-muted small">
              <i className="fas fa-shield-alt text-success me-1"></i>
              Secure checkout powered by Stripe
            </div>
          </div>

          {/* Modern Order Summary */}
          <div className="card border-0 shadow-sm" style={{borderRadius: '16px'}}>
            <div className="card-body p-0">
              <button 
                className="btn btn-link text-decoration-none w-100 p-4 d-flex align-items-center justify-content-between"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                style={{borderRadius: '16px'}}
              >
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                    <i className="fas fa-receipt" style={{fontSize: '1rem'}}></i>
                  </div>
                  <div className="text-start">
                    <div className="fw-bold text-dark">Order Summary</div>
                    <small className="text-muted">Total: {formatCurrency(totalAmount)}</small>
                  </div>
                </div>
                <i className={`fas fa-chevron-${showOrderSummary ? 'up' : 'down'} text-muted`}></i>
              </button>
              
              {showOrderSummary && (
                <div className="px-4 pb-4">
                  <hr className="mt-0 mb-4" />
                  <div className="space-y-3">
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-spa text-primary me-2"></i>
                        <span>{service.name}</span>
                      </div>
                      <span className="fw-medium">{formatCurrency(service.price)}</span>
                    </div>
                    
                    {appliedCoupon && couponDiscount > 0 && (
                      <div className="d-flex justify-content-between align-items-center py-2 text-success">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-tag me-2"></i>
                          <span>Coupon ({appliedCoupon.code})</span>
                        </div>
                        <span className="fw-medium">-{formatCurrency(couponDiscount)}</span>
                      </div>
                    )}
                    
                    {appliedGiftCard && giftCardDiscount > 0 && (
                      <div className="d-flex justify-content-between align-items-center py-2 text-success">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-gift me-2"></i>
                          <span>Gift Card ({appliedGiftCard.code})</span>
                        </div>
                        <span className="fw-medium">-{formatCurrency(giftCardDiscount)}</span>
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center py-2 border-top">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <span>Tax (7.75%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <div className="d-flex align-items-center">
                        <span>{getStripeFeeExplanation(selectedPaymentMethod)}</span>
                        <i className="fas fa-info-circle text-muted ms-1" title="Secure payment processing"></i>
                      </div>
                      <span>{formatCurrency(stripeFee)}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center py-3 border-top border-2">
                      <span className="fw-bold h6 mb-0">Total Amount</span>
                      <span className="fw-bold h6 mb-0">{formatCurrency(totalAmount)}</span>
                    </div>
                    
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-primary">Due Today (Deposit)</span>
                        <span className="fw-bold text-primary h6 mb-0">{formatCurrency(depositAmount + stripeFee)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Remaining balance (due at appointment)</small>
                        <small className="text-muted fw-medium">{formatCurrency(remainingAmount)}</small>
                      </div>
                    </div>
                    
                    {(appliedCoupon || appliedGiftCard) && (
                      <div className="bg-success bg-opacity-10 p-3 rounded-3">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <small className="text-success fw-medium">
                            {appliedCoupon && appliedGiftCard ? (
                              `You saved ${formatCurrency(couponDiscount + giftCardDiscount)} total! (${formatCurrency(couponDiscount)} coupon + ${formatCurrency(giftCardDiscount)} gift card)`
                            ) : appliedCoupon ? (
                              `You saved ${formatCurrency(couponDiscount)} with coupon ${appliedCoupon.code}!`
                            ) : (
                              `You saved ${formatCurrency(giftCardDiscount)} with gift card ${appliedGiftCard?.code}!`
                            )}
                          </small>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Cherry, Klarna, and Affirm require full payment upfront
                      </small>
                    </div>
                  </div>
                </div>
              )}
              
              {!showOrderSummary && (
                <div className="px-4 pb-4">
                  <div className="text-center">
                    <div className="h4 mb-1 text-primary">{formatCurrency(depositAmount + stripeFee)}</div>
                    <div className="text-muted small">Due today (includes processing fee)</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { CheckoutData, ServiceItem };
