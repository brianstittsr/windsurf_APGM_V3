'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
}

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

export default function StripePaymentForm({
  amount,
  onSuccess,
  onError,
  loading = false,
  setLoading
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });

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
      console.log('🔍 Frontend using publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
      
      // Create payment intent on the server
      console.log('📡 Calling /api/create-payment-intent...');
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
        }),
      });

      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('📡 API Response data:', responseData);
      
      const { client_secret, payment_intent_id } = responseData;

      if (!client_secret) {
        console.error('❌ No client_secret in response:', responseData);
        console.error('❌ Full response data:', JSON.stringify(responseData, null, 2));
        
        // Check if it's a Stripe configuration error
        if (responseData.error && responseData.error.includes('Stripe')) {
          throw new Error('Payment system configuration error. Please contact support.');
        }
        
        throw new Error('Failed to create payment session. Please try again or contact support.');
      }
      
      console.log('✅ Payment intent created:', payment_intent_id);
      console.log('🔑 Client secret received:', client_secret.substring(0, 20) + '...');

      // Confirm payment with the card element
      const cardElement = elements.getElement(CardNumberElement) || elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('💳 Confirming payment with Stripe...');
      console.log('Card element found:', !!cardElement);
      console.log('Cardholder name:', cardholderName);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
            address: billingAddress,
          },
        },
      });
      
      console.log('💳 Stripe confirmation result:');
      console.log('Error:', error);
      console.log('Payment Intent:', paymentIntent);

      if (error) {
        console.error('❌ Payment failed:', error);
        console.error('Error type:', error.type);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Provide more specific error messages
        let errorMessage = error.message || 'Payment failed';
        if (error.code === 'payment_intent_unexpected_state') {
          errorMessage = 'Payment intent is in an unexpected state. Please try again.';
        } else if (error.message?.includes('No such payment_intent')) {
          errorMessage = 'Payment session expired. Please refresh the page and try again.';
        }
        
        onError(errorMessage);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent);
        onSuccess(paymentIntent);
      } else {
        console.error('❌ Unexpected payment state:', paymentIntent?.status);
        onError('Payment completed but status is unclear. Please contact support.');
      }
    } catch (err) {
      console.error('❌ Payment process error:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
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

  const isFormValid = cardholderName.trim() !== '' && 
                     billingAddress.line1.trim() !== '' && 
                     billingAddress.city.trim() !== '' && 
                     billingAddress.state.trim() !== '' && 
                     billingAddress.postal_code.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
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

        <div className="col-12 mb-3">
          <label htmlFor="address-line1" className="form-label">
            Billing Address <span className="text-danger">*</span>
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
    </form>
  );
}
