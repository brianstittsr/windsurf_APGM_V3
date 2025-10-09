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
  totalAmount?: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  onPaymentMethodChange?: (method: PaymentMethod) => void;
}

export type PaymentMethod = 'card' | 'klarna' | 'affirm' | 'cherry' | 'afterpay';

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
  totalAmount,
  onSuccess,
  onError,
  loading = false,
  setLoading,
  onPaymentMethodChange
}: MultiPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentCreatedAt, setPaymentIntentCreatedAt] = useState<number>(0);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  // Notify parent of initial payment method on mount
  React.useEffect(() => {
    if (onPaymentMethodChange) {
      onPaymentMethodChange('card');
    }
  }, [onPaymentMethodChange]);
  
  // Pre-approval states for Klarna and Affirm
  const [klarnaApproved, setKlarnaApproved] = useState<boolean | null>(null);
  const [affirmApproved, setAffirmApproved] = useState<boolean | null>(null);
  
  // Determine payment amount based on method
  const getPaymentAmount = (method: PaymentMethod) => {
    // These payment methods require full payment
    if (['cherry', 'klarna', 'affirm', 'afterpay'].includes(method)) {
      return totalAmount || amount;
    }
    // Card payments use deposit amount
    return amount;
  };
  
  const currentPaymentAmount = getPaymentAmount(selectedPaymentMethod);
  
  // Card payment states
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    email: ''
  });

  const createPaymentIntent = async (paymentMethodTypes: string[]) => {
    console.log('📡 Creating payment intent for methods:', paymentMethodTypes);
    console.log('📡 Payment amount (cents):', Math.round(currentPaymentAmount * 100));
    
    try {
      const requestBody = {
        amount: Math.round(currentPaymentAmount * 100), // Convert to cents
        currency: 'usd',
        payment_method_types: paymentMethodTypes,
      };
      
      console.log('📡 Request body:', JSON.stringify(requestBody));
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        // Try to parse error as JSON for more details
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.error || errorJson.message || errorText;
          if (errorJson.details) {
            console.error('❌ Error details:', errorJson.details);
          }
        } catch (parseError) {
          console.error('❌ Could not parse error response as JSON');
        }
        
        throw new Error(`Payment session creation failed: ${response.status} - ${errorDetails}`);
      }

      const responseData = await response.json();
      console.log('📡 API Response data:', responseData);
      
      if (responseData.error) {
        console.error('❌ API returned error:', responseData.error);
        if (responseData.details) {
          console.error('❌ Error details:', responseData.details);
        }
        throw new Error(responseData.error);
      }
      
      const { client_secret, payment_intent_id } = responseData;

      if (!client_secret) {
        console.error('❌ No client_secret in response:', responseData);
        throw new Error('Failed to create payment intent - no client_secret returned');
      }

      setClientSecret(client_secret);
      setPaymentIntentId(payment_intent_id);
      setPaymentIntentCreatedAt(Date.now());
      
      console.log('✅ Payment intent created:', payment_intent_id);
      return { client_secret, payment_intent_id };
    } catch (error) {
      console.error('❌ Payment intent creation failed:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Clear any stale payment intent data
      setClientSecret('');
      setPaymentIntentId('');
      setPaymentIntentCreatedAt(0);
      throw error;
    }
  };

  const isPaymentIntentExpired = () => {
    const EXPIRY_TIME = 20 * 60 * 1000; // 20 minutes in milliseconds
    return Date.now() - paymentIntentCreatedAt > EXPIRY_TIME;
  };

  const refreshPaymentIntentIfNeeded = async (method: PaymentMethod) => {
    if (method === 'cherry') return null;
    
    // Always create new payment intent if missing or expired
    if (!clientSecret || isPaymentIntentExpired()) {
      console.log('🔄 Creating new payment intent (expired or missing)');
      let paymentMethodTypes: string[];
      if (method === 'klarna') {
        paymentMethodTypes = ['klarna'];
      } else if (method === 'affirm') {
        paymentMethodTypes = ['affirm'];
      } else {
        paymentMethodTypes = ['card'];
      }
      
      try {
        const result = await createPaymentIntent(paymentMethodTypes);
        return result.client_secret;
      } catch (error) {
        console.error('Failed to create payment intent:', error);
        console.error('Full error details:', error);
        // Show the actual error message to help debug
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to create or refresh payment session: ${errorMessage}`);
      }
    }
    
    return clientSecret;
  };

  const handlePaymentMethodChange = async (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);

    // Notify parent component of payment method change
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }

    // Clear previous payment intent when switching methods
    setClientSecret('');
    setPaymentIntentId('');
    setPaymentIntentCreatedAt(0);

    // Reset approval states when switching methods
    if (method !== 'klarna') setKlarnaApproved(null);
    if (method !== 'affirm') setAffirmApproved(null);

    let paymentMethodTypes: string[] = [];

    if (method === 'card') {
      paymentMethodTypes = ['card'];
    } else if (method === 'klarna') {
      paymentMethodTypes = ['klarna'];
    } else if (method === 'affirm') {
      paymentMethodTypes = ['affirm'];
    } else if (method === 'afterpay') {
      paymentMethodTypes = ['afterpay_clearpay'];
    } else if (method === 'cherry') {
      // Cherry doesn't use Stripe payment intents
      return;
    }

    // Create payment intent for the selected method
    try {
      const result = await createPaymentIntent(paymentMethodTypes);
      if (result) {
        console.log(`✅ Payment intent created for ${method}:`, result.payment_intent_id);
      }
    } catch (error) {
      console.error(`❌ Failed to create payment intent for ${method}:`, error);
      onError(`Failed to initialize ${method} payment. Please try again.`);
    }
  };

  const handleCardPayment = async (client_secret: string) => {
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }
    
    if (!elements) {
      throw new Error('Stripe Elements not initialized');
    }
    
    // Wait for elements to be ready
    const cardElement = elements.getElement(CardNumberElement) || elements.getElement(CardElement);
    
    if (!cardElement) {
      throw new Error('Card element not found. Please refresh the page and try again.');
    }

    console.log('💳 Confirming card payment...');
    
    // Ensure the card element is ready before confirming payment
    try {
      cardElement.focus();
    } catch (focusError) {
      console.warn('Card element focus warning:', focusError);
    }
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
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

  const handleAfterpayPayment = async (client_secret: string) => {
    console.log('💳 Confirming AfterPay payment...');
    
    const { error, paymentIntent } = await stripe!.confirmAfterpayClearpayPayment(client_secret, {
      payment_method: {
        billing_details: {
          name: cardholderName || 'Customer Name',
          email: billingAddress.email || '',
          address: {
            line1: billingAddress.line1,
            city: billingAddress.city,
            state: billingAddress.state,
            postal_code: billingAddress.postal_code,
            country: billingAddress.country || 'US',
          },
        },
      },
      return_url: `${window.location.origin}/payment-success`,
      shipping: {
        name: cardholderName || 'Customer Name',
        address: {
          line1: billingAddress.line1,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postal_code,
          country: billingAddress.country || 'US',
        },
      },
    });

    return { error, paymentIntent };
  };

  const handleCherryPayment = async () => {
    console.log('🍒 Redirecting to Cherry payment...');
    
    // Cherry uses external payment flow - redirect to their payment page
    const cherryUrl = 'https://pay.withcherry.com/a-pretty-girl-matter-llc?utm_source=practice&m=64197';
    
    // Open Cherry payment in new tab/window
    window.open(cherryUrl, '_blank');
    
    // Return a mock success result since Cherry handles payment externally
    // The actual payment confirmation will happen through Cherry's system
    return { 
      error: null, 
      paymentIntent: { 
        id: 'cherry_redirect', 
        status: 'requires_action',
        payment_method_types: ['cherry']
      } 
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe) {
      onError('Stripe has not loaded yet. Please wait a moment and try again.');
      return;
    }

    if (!elements) {
      onError('Stripe Elements have not loaded yet. Please wait a moment and try again.');
      return;
    }

    if (processing) {
      console.log('Payment already in progress, ignoring duplicate submission');
      return;
    }

    console.log('Starting payment process for method:', selectedPaymentMethod);
    setProcessing(true);
    if (setLoading) setLoading(true);

    try {
      if (selectedPaymentMethod === 'cherry') {
        await handleCherryPayment();
        return;
      }

      // Ensure we have a valid payment intent before processing
      let currentClientSecret;
      try {
        currentClientSecret = await refreshPaymentIntentIfNeeded(selectedPaymentMethod);
        
        if (!currentClientSecret) {
          throw new Error('Failed to create or refresh payment session. Please try again.');
        }
        
        console.log('✅ Using client_secret for payment:', currentClientSecret.substring(0, 20) + '...');
      } catch (intentError) {
        console.error('Payment intent creation failed:', intentError);
        throw new Error('Unable to initialize payment. Please check your connection and try again.');
      }

      let result;
      if (selectedPaymentMethod === 'card') {
        result = await handleCardPayment(currentClientSecret);
      } else if (selectedPaymentMethod === 'klarna') {
        result = await handleKlarnaPayment(currentClientSecret);
      } else if (selectedPaymentMethod === 'affirm') {
        result = await handleAffirmPayment(currentClientSecret);
      } else if (selectedPaymentMethod === 'afterpay') {
        result = await handleAfterpayPayment(currentClientSecret);
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
        } else if (error.message?.includes('No such payment_intent') || error.code === 'payment_intent_not_found') {
          // Try to refresh the payment intent and retry automatically
          try {
            console.log('🔄 Payment intent not found, attempting to refresh and retry...');
            const newClientSecret = await refreshPaymentIntentIfNeeded(selectedPaymentMethod);
            
            if (newClientSecret) {
              console.log('✅ Payment intent refreshed, retrying payment automatically...');
              
              // Retry the payment with the new client secret
              let retryResult;
              if (selectedPaymentMethod === 'card') {
                retryResult = await handleCardPayment(newClientSecret);
              } else if (selectedPaymentMethod === 'klarna') {
                retryResult = await handleKlarnaPayment(newClientSecret);
              } else if (selectedPaymentMethod === 'affirm') {
                retryResult = await handleAffirmPayment(newClientSecret);
              }
              
              if (retryResult && !retryResult.error) {
                console.log('✅ Payment succeeded after refresh');
                onSuccess(retryResult.paymentIntent);
                return; // Exit early on success
              } else if (retryResult?.error) {
                errorMessage = retryResult.error.message || 'Payment failed after refresh. Please try again.';
              } else {
                errorMessage = 'Payment failed after refresh. Please try again.';
              }
            } else {
              errorMessage = 'Unable to refresh payment session. Please try again.';
            }
          } catch (refreshError) {
            console.error('Failed to refresh payment intent:', refreshError);
            errorMessage = 'Payment session expired. Please refresh the page and try again.';
          }
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

  const isCherryFormValid = selectedPaymentMethod !== 'cherry' || true; // Cherry doesn't require form validation

  // Check if approval is required and granted for Klarna/Affirm
  const isKlarnaApprovalValid = selectedPaymentMethod !== 'klarna' || klarnaApproved === true;
  const isAffirmApprovalValid = selectedPaymentMethod !== 'affirm' || affirmApproved === true;

  const isFormValid = isCardFormValid && isKlarnaFormValid && isAffirmFormValid && isCherryFormValid && isKlarnaApprovalValid && isAffirmApprovalValid;

  // Show loading state if Stripe hasn't loaded yet
  if (!stripe) {
    return (
      <div className="text-center py-4">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Payment System Error</strong>
          <p className="mb-0 mt-2">Unable to load payment system. Please check that Stripe keys are configured properly.</p>
          <small className="text-muted d-block mt-1">
            Check browser console for detailed error information.
          </small>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="multi-payment-form">
      {/* Payment Method Selection */}
      <div className="mb-4">
        <h5 className="mb-3">Choose Payment Method</h5>
        <div className="row">
          <div className="col-md-3 mb-2">
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
          <div className="col-md-3 mb-2">
            <div 
              className={`card payment-method-card ${selectedPaymentMethod === 'afterpay' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handlePaymentMethodChange('afterpay')}
            >
              <div className="card-body text-center py-3">
                <div className="d-flex justify-content-center mb-2" style={{ height: '48px' }}>
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/0/04/Afterpay_logo.jpg" 
                    alt="AfterPay Logo" 
                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  />
                </div>
                <h6 className="mb-0">AfterPay</h6>
                <small className="text-muted">Pay in 4 interest-free installments</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div 
              className={`card payment-method-card ${selectedPaymentMethod === 'klarna' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handlePaymentMethodChange('klarna')}
            >
              <div className="card-body text-center py-3">
                <div className="d-flex justify-content-center mb-2" style={{ height: '48px' }}>
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2024/06/Klarna-Symbol.png" 
                    alt="Klarna Logo" 
                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  />
                </div>
                <h6 className="mb-0">Klarna</h6>
                <small className="text-muted">Pay in 4 interest-free installments</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div 
              className={`card payment-method-card ${selectedPaymentMethod === 'affirm' ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handlePaymentMethodChange('affirm')}
            >
              <div className="card-body text-center py-3">
                <div className="d-flex justify-content-center mb-2" style={{ height: '48px' }}>
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQASxDA7wX68xJ32zCBksW76SH8skp63-eZw&s" 
                    alt="Affirm Logo" 
                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  />
                </div>
                <h6 className="mb-0">Affirm</h6>
                <small className="text-muted">Monthly payments as low as 0% APR</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-2">
            <div 
              className={`card payment-method-card ${selectedPaymentMethod === 'cherry' ? 'border-primary' : ''}`}
              onClick={() => handlePaymentMethodChange('cherry')}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body text-center py-3">
                <div className="d-flex justify-content-center mb-2" style={{ height: '48px' }}>
                  <img 
                    src="https://cdn.prod.website-files.com/681bf1d6f7dea459fe255c59/68252146834983973a92051f_cherry-logo-primary.svg" 
                    alt="Cherry Logo" 
                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  />
                </div>
                <h6 className="mb-0">Cherry</h6>
                <small className="text-muted">Flexible payment plans</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Payment Form */}
      {selectedPaymentMethod === 'card' && (
        <div className="card-payment-section">
          <h6 className="mb-3">Card Information</h6>
          
          {!elements && (
            <div className="alert alert-info">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading card payment form...
              </div>
            </div>
          )}
          
          {elements && (
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
          )}
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

      {/* Klarna Payment Information */}
      {selectedPaymentMethod === 'klarna' && (
        <div className="klarna-payment-section">
          <div className="alert alert-warning">
            <h6 className="alert-heading">
              <i className="fas fa-calendar-check me-2" style={{ color: '#FFB800' }}></i>
              Klarna Full Payment Required
            </h6>
            <p className="mb-2">
              <strong>Full Payment:</strong> ${currentPaymentAmount.toFixed(2)} total (no remaining balance)
            </p>
            <p className="mb-0">
              Klarna will allow you to pay in 4 interest-free installments, but the full service amount is processed upfront.
            </p>
          </div>
          
          {/* Klarna Pre-approval Check */}
          <div className="card border-warning mb-3">
            <div className="card-body">
              <h6 className="card-title text-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Klarna Pre-approval Required
              </h6>
              <p className="card-text mb-3">
                Have you been approved by Klarna for the full amount of <strong>${currentPaymentAmount.toFixed(2)}</strong>?
              </p>
              
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="klarnaApproval"
                    id="klarnaApprovedYes"
                    checked={klarnaApproved === true}
                    onChange={() => setKlarnaApproved(true)}
                  />
                  <label className="form-check-label" htmlFor="klarnaApprovedYes">
                    Yes, I have been approved by Klarna for this amount
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="klarnaApproval"
                    id="klarnaApprovedNo"
                    checked={klarnaApproved === false}
                    onChange={() => setKlarnaApproved(false)}
                  />
                  <label className="form-check-label" htmlFor="klarnaApprovedNo">
                    No, I need to get approved first
                  </label>
                </div>
              </div>
              
              {klarnaApproved === false && (
                <div className="alert alert-warning">
                  <p className="mb-2">
                    <strong>You need Klarna approval before proceeding.</strong>
                  </p>
                  <p className="mb-2">
                    Please visit Klarna to create an account and get approved for the full amount:
                  </p>
                  <a 
                    href="https://www.klarna.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-warning btn-sm"
                  >
                    <i className="fas fa-external-link-alt me-2"></i>
                    Get Approved at Klarna.com
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Affirm Payment Information */}
      {selectedPaymentMethod === 'affirm' && (
        <div className="affirm-payment-section">
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="fas fa-calendar-check me-2" style={{ color: '#0FA8E6' }}></i>
              Affirm Full Payment Required
            </h6>
            <p className="mb-2">
              <strong>Full Payment:</strong> ${currentPaymentAmount.toFixed(2)} total (no remaining balance)
            </p>
            <p className="mb-0">
              Affirm offers monthly payment plans with rates as low as 0% APR, but the full service amount is processed upfront.
            </p>
          </div>
          
          {/* Affirm Pre-approval Check */}
          <div className="card border-info mb-3">
            <div className="card-body">
              <h6 className="card-title text-info">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Affirm Pre-approval Required
              </h6>
              <p className="card-text mb-3">
                Have you been approved by Affirm for the full amount of <strong>${currentPaymentAmount.toFixed(2)}</strong>?
              </p>
              
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="affirmApproval"
                    id="affirmApprovedYes"
                    checked={affirmApproved === true}
                    onChange={() => setAffirmApproved(true)}
                  />
                  <label className="form-check-label" htmlFor="affirmApprovedYes">
                    Yes, I have been approved by Affirm for this amount
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="affirmApproval"
                    id="affirmApprovedNo"
                    checked={affirmApproved === false}
                    onChange={() => setAffirmApproved(false)}
                  />
                  <label className="form-check-label" htmlFor="affirmApprovedNo">
                    No, I need to get approved first
                  </label>
                </div>
              </div>
              
              {affirmApproved === false && (
                <div className="alert alert-info">
                  <p className="mb-2">
                    <strong>You need Affirm approval before proceeding.</strong>
                  </p>
                  <p className="mb-2">
                    Please visit Affirm to create an account and get approved for the full amount:
                  </p>
                  <a 
                    href="https://www.affirm.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-info btn-sm"
                  >
                    <i className="fas fa-external-link-alt me-2"></i>
                    Get Approved at Affirm.com
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cherry Payment Information */}
      {selectedPaymentMethod === 'cherry' && (
        <div className="cherry-payment-section">
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="fas fa-heart me-2" style={{ color: '#E91E63' }}></i>
              Cherry Payment Process
            </h6>
            <p className="mb-2">Cherry requires full payment upfront with flexible payment plans. Here's what happens next:</p>
            <ol className="mb-2">
              <li><strong>Get Pre-Approved:</strong> Click "Continue with Cherry" to get pre-approved for the full amount</li>
              <li><strong>Book Your Appointment:</strong> Contact us directly to schedule your treatment</li>
              <li><strong>Say "I'm paying with Cherry":</strong> When booking, mention you'll use Cherry financing</li>
              <li><strong>Secure Checkout:</strong> We'll send you a secure checkout link to complete full payment</li>
              <li><strong>Select Payment Plan:</strong> Choose your preferred payment plan and pay the initial down payment</li>
            </ol>
            <p className="mb-2">
              <strong>Full Payment Required:</strong> ${currentPaymentAmount.toFixed(2)} total (no remaining balance)
            </p>
            <p className="mb-0">
              <strong>Contact us:</strong> Call or text to book your appointment after Cherry approval.
            </p>
          </div>
        </div>
      )}

      {/* Billing Address (for Card, Klarna and Affirm only) */}
      {selectedPaymentMethod !== 'cherry' && (
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
      )}

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
            `Pay Full Amount with Klarna - $${currentPaymentAmount.toFixed(2)}`
          ) : selectedPaymentMethod === 'affirm' ? (
            `Pay Full Amount with Affirm - $${currentPaymentAmount.toFixed(2)}`
          ) : selectedPaymentMethod === 'cherry' ? (
            `Continue with Cherry - Full Payment Required`
          ) : (
            `Pay $${currentPaymentAmount.toFixed(2)} Deposit`
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
