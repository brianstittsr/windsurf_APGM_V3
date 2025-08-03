'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../lib/stripe';
import StripePaymentForm from './StripePaymentForm';
import StripeModeIndicator from './StripeModeIndicator';
import { calculateTotalWithStripeFees, formatCurrency, getStripeFeeExplanation } from '../lib/stripe-fees';
import { InvoiceEmailService, InvoiceData } from '../services/invoiceEmailService';

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

  const handleInputChange = (field: keyof CheckoutData, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent);
    setPaymentSuccess(true);
    setPaymentError(null);
    setShowPaymentForm(false);
    
    // Send invoice email
    try {
      console.log('📧 Sending invoice email...');
      
      const invoiceData: InvoiceData = {
        invoiceNumber: InvoiceEmailService.generateInvoiceNumber(),
        clientName: clientName,
        clientEmail: 'brianstittsr@gmail.com', // Using your email as requested
        serviceName: service.name,
        servicePrice: subtotal,
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
        paymentIntentId: paymentIntent.id
      };
      
      const emailSent = await InvoiceEmailService.sendInvoiceEmail(invoiceData);
      
      if (emailSent) {
        console.log('✅ Invoice email sent successfully!');
      } else {
        console.log('⚠️ Invoice email failed to send, but payment was successful');
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      // Don't fail the payment flow if email fails
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
  
  const feeCalculation = calculateTotalWithStripeFees(service.price, taxRate, fixedDeposit);
  
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
              
              {!showPaymentForm && !paymentSuccess && (
                <>
                  <h6 className="mb-3">Payment Method</h6>
                  <div className="border rounded p-3 text-center text-muted">
                    <i className="fas fa-credit-card fa-2x mb-2"></i>
                    <div>Add payment method for deposit</div>
                    <button 
                      className="btn btn-primary btn-sm mt-2"
                      onClick={handleAddPaymentMethod}
                      disabled={paymentLoading}
                    >
                      Add Payment Method
                    </button>
                  </div>
                </>
              )}
              
              {/* Stripe Payment Form */}
              {showPaymentForm && !paymentSuccess && (
                <div className="mt-4">
                  <h6 className="mb-3">Payment Details</h6>
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      amount={depositAmount + stripeFee}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      loading={paymentLoading}
                      setLoading={setPaymentLoading}
                    />
                  </Elements>
                  
                  <div className="mt-3">
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowPaymentForm(false)}
                      disabled={paymentLoading}
                    >
                      Cancel
                    </button>
                  </div>
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
          {!showPaymentForm && (
            <div className="d-flex justify-content-between mb-4">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={onBack}
                disabled={paymentLoading}
              >
                Back
              </button>
              {!paymentSuccess && (
                <button
                  type="button"
                  className="btn btn-outline-primary px-4 fw-bold"
                  onClick={() => setShowPaymentForm(true)}
                  disabled={paymentLoading}
                >
                  Proceed to Payment
                </button>
              )}
            </div>
          )}

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
                <div className="text-primary fw-bold">{formatCurrency(depositAmount)} due now</div>
                <div className="text-muted small">Includes {formatCurrency(stripeFee)} processing fee</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { CheckoutData, ServiceItem };
