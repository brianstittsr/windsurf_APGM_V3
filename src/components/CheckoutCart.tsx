'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../lib/stripe';
import MultiPaymentForm from './MultiPaymentForm';
import StripeModeIndicator from './StripeModeIndicator';
import CouponInput from './CouponInput';
import { calculateTotalWithStripeFees, formatCurrency, getStripeFeeExplanation } from '../lib/stripe-fees';
import { CouponCode } from '@/types/database';

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

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    setPaymentSuccess(true);
    setPaymentError(null);
    setShowPaymentForm(false);
    
    try {
      // 1. Create appointment in Firebase
      console.log('📅 Creating appointment in Firebase...');
      
      // Determine if this is a full payment or deposit based on payment method
      const isFullPayment = paymentIntent.payment_method_types?.includes('klarna') || 
                           paymentIntent.payment_method_types?.includes('affirm') || 
                           paymentIntent.payment_method_types?.includes('cherry') ||
                           paymentIntent.id === 'cherry_redirect';
      
      const appointmentData = {
        clientId: 'temp-client-id', // This should be replaced with actual client ID from auth
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
        giftCardCode: data.giftCard || undefined,
        ...(appliedCoupon && { couponCode: appliedCoupon.code }),
        ...(couponDiscount > 0 && { couponDiscount }),
        rescheduleCount: 0,
        confirmationSent: false,
        reminderSent: false
      };

      // Import the services we need
      const { AppointmentService, AvailabilityService } = await import('@/services/database');
      
      const appointmentId = await AppointmentService.createAppointment(appointmentData);
      console.log('✅ Appointment created:', appointmentId);

      // 2. Remove availability for the booked time slot
      console.log('🚫 Removing availability for booked time slot...');
      await AvailabilityService.bookTimeSlot(appointmentDate, appointmentTime, appointmentId, 'victoria');
      console.log('✅ Time slot marked as unavailable');

      // 3. Apply coupon usage if one was used
      if (appliedCoupon) {
        console.log('🎫 Applying coupon usage...');
        const { CouponService } = await import('@/services/couponService');
        await CouponService.applyCoupon(appliedCoupon.id);
        console.log('✅ Coupon usage applied');
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

  // Calculate amounts with Stripe fees included
  const taxRate = 0.0775; // 7.75% tax
  const fixedDeposit = 200; // Fixed $200 deposit for all services
  
  // Apply coupon discount to service price before calculating fees
  const discountedServicePrice = Math.max(0, service.price - couponDiscount);
  
  const feeCalculation = calculateTotalWithStripeFees(discountedServicePrice, taxRate, fixedDeposit);
  
  const subtotal = feeCalculation.subtotal;
  const tax = feeCalculation.tax;
  const stripeFee = feeCalculation.stripeFee;
  const totalAmount = feeCalculation.total;
  const depositAmount = feeCalculation.deposit;
  const remainingAmount = feeCalculation.remaining;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Welcome Section */}
          <div className="mb-4">
            <h2 className="h4 mb-1">Welcome, Brian S</h2>
            <h3 className="h5 text-primary mb-3">A Pretty Girl Matter</h3>
          </div>

          {/* Stripe Mode Indicator */}
          <StripeModeIndicator />

          {/* Who Are You Booking For */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Who Are You Booking For?</h5>
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <div className="fw-bold">Brian Stitt (Me)</div>
                </div>
              </div>
            </div>
          </div>

          {/* About Your Appointment */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">About your appointment</h5>
              <div className="form-group">
                <label htmlFor="specialRequests" className="form-label">
                  Do you have any special requests or ideas to share with your service provider? (optional)
                </label>
                <textarea
                  className="form-control"
                  id="specialRequests"
                  rows={3}
                  value={data.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Enter any special requests or ideas..."
                />
              </div>
            </div>
          </div>

          {/* Gift Card Section */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Gift Card</h5>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowGiftCard(!showGiftCard)}
                >
                  Add Gift Card
                </button>
              </div>
              {showGiftCard && (
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter gift card code"
                    value={data.giftCard}
                    onChange={(e) => handleInputChange('giftCard', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Coupon Code Section */}
          <CouponInput
            serviceId={service.id}
            orderAmount={service.price}
            onCouponApplied={handleCouponApplied}
            appliedCoupon={appliedCoupon}
          />

          {/* Deposit Information */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title text-warning mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                This Business Requires a Deposit:
              </h5>
              <p className="mb-3">A payment card is required to pay deposit. The remaining balance is due when you arrive at the business.</p>
              
              {/* Payment Success Message */}
              {paymentSuccess && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  Payment successful! Proceeding to confirmation...
                </div>
              )}
              
              {/* Payment Error Message */}
              {paymentError && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {paymentError}
                </div>
              )}
              
              {!paymentSuccess && (
                <div className="mt-4">
                  <h6 className="mb-3">Payment Options</h6>
                  <Elements stripe={stripePromise}>
                    <MultiPaymentForm
                      amount={depositAmount + stripeFee}
                      totalAmount={totalAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      loading={paymentLoading}
                      setLoading={setPaymentLoading}
                    />
                  </Elements>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Cancellation Policy</h5>
              <p className="text-muted small">
                Clients are requested to arrive on time for their appointments. A grace period of 15 minutes is permitted for appointments exceeding one hour; however, if you arrive more than 15 minutes late, we cannot guarantee your service and will need to reschedule, incurring a $50.00 rebooking fee. All deposits are nonrefundable and will be applied towards the service. Only one reschedule is permitted per appointment. We appreciate your understanding of our policies, which are in place to ensure the safety and satisfaction of all clients.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between mb-4">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={onBack}
              disabled={paymentLoading}
            >
              Back
            </button>
          </div>

          {/* Order Summary Toggle */}
          <div className="text-center">
            <button 
              className="btn btn-link text-decoration-none"
              onClick={() => setShowOrderSummary(!showOrderSummary)}
            >
              <span className="me-2">View Order Summary</span>
              <i className={`fas fa-chevron-${showOrderSummary ? 'up' : 'down'}`}></i>
            </button>
            
            {showOrderSummary && (
              <div className="card mt-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>{service.name}:</span>
                    <span>{formatCurrency(service.price)}</span>
                  </div>
                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>
                        <i className="fas fa-tag me-1"></i>
                        Coupon ({appliedCoupon.code}):
                      </span>
                      <span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (7.75%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>{getStripeFeeExplanation()}:</span>
                    <span>{formatCurrency(stripeFee)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-bold">Total:</span>
                    <span className="fw-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-primary">
                    <span className="fw-bold">Deposit:</span>
                    <span className="fw-bold">{formatCurrency(depositAmount)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mt-1">
                    <span>Remaining balance (due at appointment):</span>
                    <span>{formatCurrency(remainingAmount)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
                      <small className="text-success">
                        <i className="fas fa-check-circle me-1"></i>
                        You saved {formatCurrency(couponDiscount)} with coupon {appliedCoupon.code}!
                      </small>
                    </div>
                  )}
                  <div className="mt-2 p-2 bg-light rounded">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Processing fee covers secure payment handling and is added to your total.
                    </small>
                  </div>
                </div>
              </div>
            )}
            
            {!showOrderSummary && (
              <div className="mt-2">
                <div className="h5 mb-1">{formatCurrency(totalAmount)}</div>
                <div className="text-primary fw-bold">{formatCurrency(depositAmount)} due now (deposit)</div>
                <div className="text-muted small">Includes {formatCurrency(stripeFee)} processing fee</div>
                <div className="text-muted small">Note: Cherry, Klarna, and Affirm require full payment upfront</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { CheckoutData, ServiceItem };
