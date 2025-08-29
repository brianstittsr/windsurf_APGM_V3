'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  productName: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export default function PaymentForm({ 
  clientSecret, 
  amount, 
  productName, 
  onSuccess, 
  onError, 
  onCancel 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setCardError(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess({
          paymentIntentId: paymentIntent.id,
          amount: amount,
          status: paymentIntent.status
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setCardError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-credit-card me-2"></i>
          Complete Payment - ${amount.toFixed(2)}
        </h5>
      </div>
      <div className="card-body p-4">
        <div className="mb-3">
          <p className="text-muted mb-2">
            <strong>Product:</strong> {productName}
          </p>
          <p className="text-muted mb-3">
            <strong>Amount:</strong> ${amount.toFixed(2)} USD
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="fas fa-credit-card me-2"></i>
              Card Information
            </label>
            <div className="border rounded p-3 bg-light">
              <CardElement 
                options={cardElementOptions}
                onChange={handleCardChange}
              />
            </div>
            {cardError && (
              <div className="text-danger small mt-2">
                <i className="fas fa-exclamation-triangle me-1"></i>
                {cardError}
              </div>
            )}
          </div>

          <div className="alert alert-info border-0 rounded-3 small mb-3">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Test Cards:</strong> Use 4242 4242 4242 4242 for testing, or enter real card details for live payments.
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary btn-lg flex-fill"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-lock me-2"></i>
                  Pay ${amount.toFixed(2)}
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
