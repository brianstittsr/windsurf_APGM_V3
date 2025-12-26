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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarCheck, User, MessageSquare, CreditCard, Gift, FileText, Shield, Clock, CalendarX, Ban, ArrowLeft, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

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
      
      // Determine if this is a full payment or deposit based on payment method
    const isPayLaterMethod = paymentIntent.payment_method_types?.includes('klarna') || 
                            paymentIntent.payment_method_types?.includes('affirm') || 
                            paymentIntent.payment_method_types?.includes('cherry') ||
                            paymentIntent.id === 'cherry_redirect';
    
    // Only credit cards can use deposits, all other methods require full payment
    const isCreditCard = paymentIntent.payment_method_types?.includes('card');
    const requiresFullPaymentDueToMethod = !isCreditCard;
    
    const isFullPayment = isPayLaterMethod || requiresFullPaymentDueToMethod;
      
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
        depositAmount: isFullPayment ? totalAmount : depositAmount,
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
        const paidAmount = isFullPayment ? totalAmount : depositAmount;
        
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
        await CouponService.useCoupon(appliedCoupon.id);
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
        const depositReduction = appliedCoupon?.depositReduction || 0;
        
        const calculation = await calculateTotalWithStripeFees(
          discountedServicePrice,
          undefined, // Use settings tax rate
          undefined, // Use settings deposit percentage
          selectedPaymentMethod,
          depositReduction
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
  }, [service.price, couponDiscount, giftCardDiscount, selectedPaymentMethod, appliedCoupon]);
  
  // Use calculated values or defaults while loading
  const subtotal = feeCalculation?.subtotal || 0;
  const tax = feeCalculation?.tax || 0;
  const stripeFee = feeCalculation?.stripeFee || 0;
  const totalAmount = feeCalculation?.total || 0;
  const depositAmount = feeCalculation?.deposit || 0;
  let remainingAmount = feeCalculation?.remaining || 0;
  
  // Check if this is a free service or 100% discount
  const isFreeService = subtotal === 0 || (appliedCoupon?.type === 'free_service');
  const is100PercentDiscount = appliedCoupon?.type === 'percentage' && appliedCoupon?.value === 100;
  
  // If free service or 100% discount, set remaining to 0
  if (isFreeService || is100PercentDiscount) {
    remainingAmount = 0;
  }
  
  // Check if MODELCALL200 or MODECALL200 coupon is applied (payment after procedure)
  const couponCode = appliedCoupon?.code?.toUpperCase();
  const isPayAfterProcedure = couponCode === 'MODELCALL200' || couponCode === 'MODECALL200';
  
  // Determine if current payment method is pay-later
  const isPayLaterMethod = ['affirm', 'klarna', 'cherry'].includes(selectedPaymentMethod.toLowerCase());
  
  // For pay-later methods, the amount to charge is the total (which includes fees)
  // For credit cards, the amount to charge is deposit + stripe fee
  const chargeAmount = isPayLaterMethod ? totalAmount : depositAmount + stripeFee;
  
  // Show loading state if settings not loaded
  if (!settingsLoaded || !feeCalculation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-[#AD6269] animate-spin" />
          <p className="mt-4 text-gray-500">Calculating pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarCheck className="w-10 h-10 text-[#AD6269]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
        <span className="inline-block bg-[#AD6269]/10 text-[#AD6269] px-4 py-2 rounded-full text-sm font-medium">
          A Pretty Girl Matter
        </span>
      </div>

      {/* Client Card */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#AD6269]" />
              Booking Details
            </h3>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified Client
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#AD6269]/10 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-[#AD6269]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{clientName}</h4>
              <p className="text-gray-500 text-sm">Primary Account Holder</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#AD6269]" />
            Special Requests
          </h3>
          <textarea
            id="specialRequests"
            rows={4}
            value={data.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="Share any special requests, ideas, or preferences with your artist..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#AD6269] focus:border-[#AD6269] outline-none resize-none"
          />
          <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
            <Info className="w-4 h-4" />
            This helps your artist prepare and customize your experience
          </p>
        </CardContent>
      </Card>

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
          {!isPayAfterProcedure && !isFreeService && !is100PercentDiscount && (
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
                      amount={chargeAmount}
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
          )}
          
          {/* Pay After Procedure Message (MODELCALL200) */}
          {isPayAfterProcedure && (
            <div className="card border-0 shadow-lg mb-4" style={{borderRadius: '16px', border: '3px solid #28a745'}}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle mb-3" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-hand-holding-usd text-success" style={{fontSize: '2.5rem'}}></i>
                  </div>
                  <h3 className="fw-bold text-success mb-2">Payment After Procedure</h3>
                  <p className="text-muted lead mb-0">Model Call Program - Special Arrangement</p>
                </div>
                
                <div className="alert alert-success border-0 mb-4" style={{backgroundColor: '#d1f2eb', borderRadius: '12px'}}>
                  <div className="text-center">
                    <h5 className="fw-bold text-success mb-3">
                      <i className="fas fa-check-circle me-2"></i>
                      No Payment Required Today
                    </h5>
                    <p className="mb-2">You have been approved for our <strong>Model Call Program</strong>.</p>
                    <p className="mb-0">Payment will be collected <strong>after your procedure is completed</strong>.</p>
                  </div>
                </div>
                
                <div className="bg-light p-4 rounded-3 mb-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Service</span>
                        <span>{service.name}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Appointment Date</span>
                        <span>{new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Appointment Time</span>
                        <span>{appointmentTime}</span>
                      </div>
                    </div>
                    <div className="col-12 border-top pt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Original Service Price</span>
                        <span className="text-muted">{formatCurrency(200)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          Deposit Credited
                        </span>
                        <span className="text-success">-{formatCurrency(50)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="fw-bold h5 mb-0 text-success">Amount Due After Procedure</span>
                        <span className="fw-bold h4 mb-0 text-success">{formatCurrency(150)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="alert alert-info border-0 mb-4" style={{borderRadius: '12px'}}>
                  <div className="d-flex align-items-start">
                    <i className="fas fa-info-circle text-info me-2 mt-1"></i>
                    <div>
                      <p className="mb-2 fw-medium">What happens next?</p>
                      <ul className="mb-0 small">
                        <li>Your appointment is confirmed - no payment needed now</li>
                        <li>A <strong>$50 deposit has been credited</strong> to your account</li>
                        <li>Attend your scheduled appointment</li>
                        <li>The remaining <strong>$150 will be collected after the procedure</strong></li>
                        <li>You'll receive a receipt via email</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="btn btn-success w-100 py-3 rounded-pill shadow-sm"
                  style={{fontSize: '1.1rem'}}
                  onClick={async () => {
                    console.log('Confirm Booking button clicked');
                    // Skip payment and go directly to confirmation
                    setPaymentSuccess(true);
                    
                    // Create appointment for pay-after-procedure bookings
                    try {
                      console.log('📅 Creating appointment for pay-after-procedure booking...');
                      
                      const appointmentData = {
                        clientId: clientId || 'temp-client-id',
                        clientName: clientName,
                        clientEmail: 'brianstittsr@gmail.com',
                        serviceId: service.id,
                        serviceName: service.name,
                        artistId: 'victoria',
                        scheduledDate: appointmentDate,
                        scheduledTime: appointmentTime,
                        status: 'confirmed' as const,
                        paymentStatus: 'pending' as const,
                        totalAmount: 150, // $200 - $50 deposit credit
                        depositAmount: 50, // Credited deposit
                        remainingAmount: 150,
                        specialRequests: data.specialRequests || '',
                        rescheduleCount: 0,
                        confirmationSent: false,
                        reminderSent: false
                      };

                      const { AppointmentService } = await import('@/services/database');
                      const appointmentId = await AppointmentService.createAppointment(appointmentData);
                      console.log('✅ Appointment created:', appointmentId);
                      
                      // Remove availability for the booked time slot
                      try {
                        const { AvailabilityService: NewAvailabilityService } = await import('@/services/availabilityService');
                        await NewAvailabilityService.bookTimeSlot('victoria', appointmentDate, appointmentTime, appointmentId);
                        console.log('✅ Time slot marked as unavailable');
                      } catch (availabilityError) {
                        console.warn('⚠️ Could not update availability:', availabilityError);
                      }
                      
                    } catch (error) {
                      console.error('Error creating appointment:', error);
                    }
                    
                    setTimeout(() => {
                      onNext();
                    }, 1000);
                  }}
                >
                  <i className="fas fa-check-circle me-2"></i>
                  Confirm Booking (No Payment Required)
                </button>
                
                <p className="text-center text-muted small mt-3 mb-0">
                  <i className="fas fa-shield-alt me-1"></i>
                  Your appointment is secured. Payment will be collected after your procedure.
                </p>
              </div>
            </div>
          )}
          
          {/* Free Service Message */}
          {(isFreeService || is100PercentDiscount) && !isPayAfterProcedure && (
            <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '16px'}}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '56px', height: '56px'}}>
                    <i className="fas fa-gift" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-1 fw-bold text-success">Free Service!</h5>
                    <p className="text-muted mb-0">No payment required</p>
                  </div>
                </div>
                
                <div className="alert alert-success border-0" style={{backgroundColor: '#d1f2eb', borderRadius: '12px'}}>
                  <div className="d-flex align-items-start">
                    <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                    <div>
                      <p className="mb-0">Your coupon covers the full cost of this service. No payment is required to complete your booking!</p>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="btn btn-success w-100 py-3 mt-3 rounded-pill"
                  onClick={() => {
                    // Skip payment and go directly to confirmation
                    setPaymentSuccess(true);
                    setTimeout(() => {
                      onNext();
                    }, 1000);
                  }}
                >
                  <i className="fas fa-check-circle me-2"></i>
                  Confirm Free Booking
                </button>
              </div>
            </div>
          )}

      {/* Policy Card */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Important Policies</h3>
              <p className="text-gray-500 text-sm">Please review before completing payment</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Punctuality</p>
                <p className="text-gray-500 text-sm">15-minute grace period for appointments over 1 hour</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarX className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Rescheduling</p>
                <p className="text-gray-500 text-sm">$50 fee for late arrivals, one reschedule allowed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Ban className="w-5 h-5 text-[#AD6269] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Deposit Policy</p>
                <p className="text-gray-500 text-sm">All deposits are non-refundable and applied to your service</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={paymentLoading}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <p className="text-gray-500 text-sm flex items-center gap-1">
          <Shield className="w-4 h-4 text-green-500" />
          Secure checkout powered by Stripe
        </p>
      </div>

    </div>
  );
}

export type { CheckoutData, ServiceItem };
