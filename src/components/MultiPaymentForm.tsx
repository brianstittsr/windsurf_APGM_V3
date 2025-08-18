'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  PaymentElement,
} from '@stripe/react-stripe-js';

interface MultiPaymentFormProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
}

type PaymentMethod = 'card' | 'klarna' | 'affirm';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export default function MultiPaymentForm({
  amount,
  onSuccess,
  onError,
  loading = false,
  setLoading
}: MultiPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  
  // Card payment states
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });

  const createPaymentIntent = async (paymentMethodTypes: string[]) => {
    console.log('📡 Creating payment intent for methods:', paymentMethodTypes);
    
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method_types: paymentMethodTypes,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    const { client_secret, payment_intent_id } = responseData;

    if (!client_secret) {
      throw new Error('Failed to create payment intent - no client_secret returned');
    }

    setClientSecret(client_secret);
    setPaymentIntentId(payment_intent_id);
    
    console.log('✅ Payment intent created:', payment_intent_id);
    return { client_secret, payment_intent_id };
  };

  const handlePaymentMethodChange = async (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    try {
      let paymentMethodTypes: string[];
      if (method === 'klarna') {
        paymentMethodTypes = ['klarna'];
      } else if (method === 'affirm') {
        paymentMethodTypes = ['affirm'];
      } else {
        paymentMethodTypes = ['card'];
      }
      await createPaymentIntent(paymentMethodTypes);
    } catch (error) {
      console.error('Error switching payment method:', error);
      onError('Failed to switch payment method. Please try again.');
    }
  };

  const handleCardPayment = async (client_secret: string) => {
    if (!elements) {
      throw new Error('Stripe Elements not initialized');
    }
    
    const cardElement = elements.getElement(CardNumberElement) || elements.getElement(CardElement);
    
    if (!cardElement) {
      throw new Error('Card element not found');
    }

    console.log('💳 Confirming card payment...');
    
    const { error, paymentIntent } = await stripe!.confirmCardPayment(client_secret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardholderName,
          address: billingAddress,
        },
      },
    });

    return { error, paymentIntent };
  };

  const handleKlarnaPayment = async (client_secret: string) => {
    console.log('🛒 Confirming Klarna payment...');
    
    const { error, paymentIntent } = await stripe!.confirmKlarnaPayment(client_secret, {
      payment_method: {
        billing_details: {
          address: billingAddress,
        },
      },
      return_url: `${window.location.origin}/payment-success`,
    });

    return { error, paymentIntent };
  };

  const handleAffirmPayment = async (client_secret: string) => {
    console.log('💰 Confirming Affirm payment...');
    
    const { error, paymentIntent } = await stripe!.confirmAffirmPayment(client_secret, {
      payment_method: {
        billing_details: {
          name: cardholderName || 'Customer Name',
          address: billingAddress,
        },
      },
      return_url: `${window.location.origin}/payment-success`,
    });

    return { error, paymentIntent };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      console.error('❌ Stripe not loaded');
      return;
    }

    setProcessing(true);
    setLoading?.(true);

    try {
      console.log('🔧 Starting payment process...');
      console.log('Amount:', amount, 'USD');
      console.log('Payment method:', selectedPaymentMethod);
      
      let currentClientSecret = clientSecret;
      
      // Create payment intent if not already created
      if (!currentClientSecret) {
        const paymentMethodTypes = selectedPaymentMethod === 'klarna' ? ['klarna'] : ['card'];
        const result = await createPaymentIntent(paymentMethodTypes);
        currentClientSecret = result.client_secret;
      }

      let result;
      
      if (selectedPaymentMethod === 'card') {
        result = await handleCardPayment(currentClientSecret);
      } else if (selectedPaymentMethod === 'klarna') {
        result = await handleKlarnaPayment(currentClientSecret);
      } else if (selectedPaymentMethod === 'affirm') {
        result = await handleAffirmPayment(currentClientSecret);
      } else {
        throw new Error('Invalid payment method selected');
      }

      const { error, paymentIntent } = result;
      
      console.log('💳 Payment confirmation result:');
      console.log('Error:', error);
      console.log('Payment Intent:', paymentIntent);

      if (error) {
        console.error('❌ Payment failed:', error);
        
        let errorMessage = error.message || 'Payment failed';
        if (error.code === 'payment_intent_unexpected_state') {
          errorMessage = 'Payment intent is in an unexpected state. Please try again.';
        } else if (error.message?.includes('No such payment_intent')) {
          errorMessage = 'Payment session expired. Please refresh the page and try again.';
        }
        
        onError(errorMessage);
      } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_action')) {
        console.log('✅ Payment succeeded:', paymentIntent);
        onSuccess(paymentIntent);
      } else {
        console.error('❌ Unexpected payment state:', paymentIntent?.status);
        onError('Payment completed but status is unclear. Please contact support.');
      }
    } catch (err) {
      console.error('❌ Payment process error:', err);
      
      let errorMessage = 'An unexpected error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('API Error')) {
          errorMessage = 'Server error. Please try again or contact support.';
        }
      }
      
      onError(errorMessage);
    } finally {
      setProcessing(false);
      setLoading?.(false);
    }
  };

  const isCardFormValid = selectedPaymentMethod !== 'card' || (
    cardholderName.trim() !== '' && 
    billingAddress.line1.trim() !== '' && 
    billingAddress.city.trim() !== '' && 
    billingAddress.state.trim() !== '' && 
    billingAddress.postal_code.trim() !== ''
  );

  const isKlarnaFormValid = selectedPaymentMethod !== 'klarna' || (
    billingAddress.line1.trim() !== '' && 
    billingAddress.city.trim() !== '' && 
    billingAddress.state.trim() !== '' && 
    billingAddress.postal_code.trim() !== ''
  );

  const isAffirmFormValid = selectedPaymentMethod !== 'affirm' || (
    cardholderName.trim() !== '' &&
    billingAddress.line1.trim() !== '' && 
    billingAddress.city.trim() !== '' && 
    billingAddress.state.trim() !== '' && 
    billingAddress.postal_code.trim() !== ''
  );

  const isFormValid = isCardFormValid && isKlarnaFormValid && isAffirmFormValid;

  return (
    <form onSubmit={handleSubmit} className="multi-payment-form">
      {/* Payment Method Selection */}
      <div className="mb-4">
        <h5 className="mb-3">Choose Payment Method</h5>
        <div className="row">
          <div className="col-md-4 mb-2">
            <div 
              className={`card payment-method-card ${selectedPaymentMethod === 'card' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handlePaymentMethodChange('card')}
            >
              <div className="card-body text-center py-3">
                <i className="fas fa-credit-card fa-2x mb-2 text-primary"></i>
                <h6 className="mb-0">Credit/Debit Card</h6>
                <small className="text-muted">Pay with Visa, Mastercard, etc.</small>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div 
              className={`card payment-method-card ${selectedPaymentMethod === 'klarna' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handlePaymentMethodChange('klarna')}
            >
              <div className="card-body text-center py-3">
                <i className="fas fa-shopping-bag fa-2x mb-2" style={{ color: '#FFB3C7' }}></i>
                <h6 className="mb-0">Klarna</h6>
                <small className="text-muted">Pay in 4 interest-free installments</small>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-2">
            <div 
              className={`card payment-method-card ${selectedPaymentMethod === 'affirm' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handlePaymentMethodChange('affirm')}
            >
              <div className="card-body text-center py-3">
                <i className="fas fa-calendar-check fa-2x mb-2" style={{ color: '#0FA8E6' }}></i>
                <h6 className="mb-0">Affirm</h6>
                <small className="text-muted">Monthly payments as low as 0% APR</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Payment Form */}
      {selectedPaymentMethod === 'card' && (
        <div className="card-payment-section">
          <h6 className="mb-3">Card Information</h6>
          
          <div className="row">
            <div className="col-12 mb-3">
              <label htmlFor="cardholder-name" className="form-label">
                Cardholder Name <span className="text-danger">*</span>
              </label>
              <input
                id="cardholder-name"
                type="text"
                className="form-control"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Full name on card"
                required
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">
                Card Number <span className="text-danger">*</span>
              </label>
              <div className="form-control" style={{ padding: '12px' }}>
                <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Expiry Date <span className="text-danger">*</span>
              </label>
              <div className="form-control" style={{ padding: '12px' }}>
                <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                CVC <span className="text-danger">*</span>
              </label>
              <div className="form-control" style={{ padding: '12px' }}>
                <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Klarna Payment Info */}
      {selectedPaymentMethod === 'klarna' && (
        <div className="klarna-payment-section">
          <div className="alert alert-info">
            <h6><i className="fas fa-info-circle me-2"></i>Pay with Klarna</h6>
            <p className="mb-0">
              Split your payment into 4 interest-free installments. You'll be redirected to Klarna to complete your purchase.
            </p>
          </div>
        </div>
      )}

      {/* Affirm Payment Section */}
      {selectedPaymentMethod === 'affirm' && (
        <div className="affirm-payment-section">
          <div className="alert alert-info">
            <h6><i className="fas fa-calendar-check me-2"></i>Pay with Affirm</h6>
            <p className="mb-0">
              Choose flexible monthly payments as low as 0% APR. You'll be redirected to Affirm to complete your purchase.
            </p>
          </div>
        </div>
      )}

      {/* Name field for Klarna and Affirm */}
      {(selectedPaymentMethod === 'klarna' || selectedPaymentMethod === 'affirm') && (
        <div className="mb-4">
          <h6 className="mb-3">Customer Information</h6>
          <div className="row">
            <div className="col-12 mb-3">
              <label htmlFor="customer-name" className="form-label">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                className="form-control"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Billing Address (for all payment methods) */}
      <div className="billing-address-section">
        <h6 className="mb-3">Billing Address</h6>
        
        <div className="row">
          <div className="col-12 mb-3">
            <label htmlFor="address-line1" className="form-label">
              Address <span className="text-danger">*</span>
            </label>
            <input
              id="address-line1"
              type="text"
              className="form-control"
              value={billingAddress.line1}
              onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
              placeholder="Address line 1"
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="address-city" className="form-label">
              City <span className="text-danger">*</span>
            </label>
            <input
              id="address-city"
              type="text"
              className="form-control"
              value={billingAddress.city}
              onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
              placeholder="City"
              required
            />
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="address-state" className="form-label">
              State <span className="text-danger">*</span>
            </label>
            <input
              id="address-state"
              type="text"
              className="form-control"
              value={billingAddress.state}
              onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
              placeholder="NC"
              maxLength={2}
              required
            />
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="address-zip" className="form-label">
              ZIP Code <span className="text-danger">*</span>
            </label>
            <input
              id="address-zip"
              type="text"
              className="form-control"
              value={billingAddress.postal_code}
              onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
              placeholder="12345"
              required
            />
          </div>
        </div>
      </div>

      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={!stripe || processing || loading || !isFormValid}
        >
          {processing || loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : selectedPaymentMethod === 'klarna' ? (
            `Continue with Klarna - $${amount.toFixed(2)}`
          ) : selectedPaymentMethod === 'affirm' ? (
            `Continue with Affirm - $${amount.toFixed(2)}`
          ) : (
            `Pay $${amount.toFixed(2)} Deposit`
          )}
        </button>
      </div>

      <div className="mt-3 text-center">
        <small className="text-muted">
          <i className="fas fa-lock me-1"></i>
          Your payment information is secure and encrypted
        </small>
      </div>

      <style jsx>{`
        .payment-method-card {
          transition: all 0.2s ease;
        }
        .payment-method-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .payment-method-card.border-primary {
          border-width: 2px !important;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </form>
  );
}
