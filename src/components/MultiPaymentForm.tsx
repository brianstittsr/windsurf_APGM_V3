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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Loader2, Lock, AlertTriangle, Info, Calendar, Heart, ExternalLink, CheckCircle } from 'lucide-react';

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
          name: cardholderName || 'Customer',
          email: billingAddress.email,
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
    });

    return { error, paymentIntent };
  };

  const handleAffirmPayment = async (client_secret: string) => {
    console.log('💰 Confirming Affirm payment...');
    
    const { error, paymentIntent } = await stripe!.confirmAffirmPayment(client_secret, {
      payment_method: {
        billing_details: {
          name: cardholderName || 'Customer',
          email: billingAddress.email,
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
    cardholderName.trim() !== '' &&
    billingAddress.email.trim() !== '' &&
    billingAddress.line1.trim() !== '' && 
    billingAddress.city.trim() !== '' && 
    billingAddress.state.trim() !== '' && 
    billingAddress.postal_code.trim() !== ''
  );

  const isAffirmFormValid = selectedPaymentMethod !== 'affirm' || (
    cardholderName.trim() !== '' &&
    billingAddress.email.trim() !== '' &&
    billingAddress.line1.trim() !== '' && 
    billingAddress.city.trim() !== '' && 
    billingAddress.state.trim() !== '' && 
    billingAddress.postal_code.trim() !== ''
  );

  const isAfterpayFormValid = selectedPaymentMethod !== 'afterpay' || (
    cardholderName.trim() !== '' &&
    billingAddress.email.trim() !== '' &&
    billingAddress.line1.trim() !== '' && 
    billingAddress.city.trim() !== '' && 
    billingAddress.state.trim() !== '' && 
    billingAddress.postal_code.trim() !== ''
  );

  const isCherryFormValid = selectedPaymentMethod !== 'cherry' || true; // Cherry doesn't require form validation

  // Check if approval is required and granted for Klarna/Affirm
  const isKlarnaApprovalValid = selectedPaymentMethod !== 'klarna' || klarnaApproved === true;
  const isAffirmApprovalValid = selectedPaymentMethod !== 'affirm' || affirmApproved === true;

  const isFormValid = isCardFormValid && isKlarnaFormValid && isAffirmFormValid && isAfterpayFormValid && isCherryFormValid && isKlarnaApprovalValid && isAffirmApprovalValid;

  // Show loading state if Stripe hasn't loaded yet
  if (!stripe) {
    return (
      <div className="text-center py-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <strong>Payment System Error</strong>
          </div>
          <p className="text-sm">Unable to load payment system. Please check that Stripe keys are configured properly.</p>
          <p className="text-xs text-red-500 mt-1">
            Check browser console for detailed error information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Credit/Debit Card */}
        <div 
          className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
            selectedPaymentMethod === 'card' 
              ? 'border-[#AD6269] bg-[#AD6269]/5 shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodChange('card')}
        >
          <div className="w-12 h-12 mx-auto mb-2 bg-[#AD6269]/10 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-[#AD6269]" />
          </div>
          <h6 className="font-semibold text-gray-900 text-sm">Credit/Debit</h6>
          <p className="text-xs text-gray-500 mt-1">Visa, Mastercard, etc.</p>
        </div>

        {/* AfterPay */}
        <div 
          className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
            selectedPaymentMethod === 'afterpay' 
              ? 'border-[#AD6269] bg-[#AD6269]/5 shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodChange('afterpay')}
        >
          <div className="w-12 h-12 mx-auto mb-2 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
            <span className="text-teal-600 font-bold text-lg">A</span>
          </div>
          <h6 className="font-semibold text-gray-900 text-sm">AfterPay</h6>
          <p className="text-xs text-gray-500 mt-1">4 interest-free payments</p>
        </div>

        {/* Klarna */}
        <div 
          className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
            selectedPaymentMethod === 'klarna' 
              ? 'border-[#AD6269] bg-[#AD6269]/5 shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodChange('klarna')}
        >
          <div className="w-12 h-12 mx-auto mb-2 bg-pink-100 rounded-full flex items-center justify-center">
            <span className="text-pink-600 font-bold text-lg">K</span>
          </div>
          <h6 className="font-semibold text-gray-900 text-sm">Klarna</h6>
          <p className="text-xs text-gray-500 mt-1">4 interest-free payments</p>
        </div>

        {/* Affirm */}
        <div 
          className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
            selectedPaymentMethod === 'affirm' 
              ? 'border-[#AD6269] bg-[#AD6269]/5 shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodChange('affirm')}
        >
          <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">affirm</span>
          </div>
          <h6 className="font-semibold text-gray-900 text-sm">Affirm</h6>
          <p className="text-xs text-gray-500 mt-1">Monthly payments 0% APR</p>
        </div>

        {/* Cherry */}
        <div 
          className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
            selectedPaymentMethod === 'cherry' 
              ? 'border-[#AD6269] bg-[#AD6269]/5 shadow-md' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodChange('cherry')}
        >
          <div className="w-12 h-12 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <h6 className="font-semibold text-gray-900 text-sm">Cherry</h6>
          <p className="text-xs text-gray-500 mt-1">Flexible payment plans</p>
        </div>
      </div>

      {/* Card Payment Form */}
      {selectedPaymentMethod === 'card' && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#AD6269]" />
              Card Information
            </h4>
            
            {!elements && (
              <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading card payment form...
              </div>
            )}
            
            {elements && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="cardholder-name"
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Full name on card"
                    required
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-[#AD6269] focus-within:border-[#AD6269]">
                    <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-[#AD6269] focus-within:border-[#AD6269]">
                      <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-[#AD6269] focus-within:border-[#AD6269]">
                      <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Klarna Payment Info */}
      {selectedPaymentMethod === 'klarna' && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
          <h4 className="font-semibold text-pink-700 flex items-center gap-2 mb-2">
            <Info className="w-5 h-5" />
            Pay with Klarna
          </h4>
          <p className="text-pink-600 text-sm">
            Split your payment into 4 interest-free installments. You'll be redirected to Klarna to complete your purchase.
          </p>
        </div>
      )}

      {/* Affirm Payment Section */}
      {selectedPaymentMethod === 'affirm' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-700 flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            Pay with Affirm
          </h4>
          <p className="text-blue-600 text-sm">
            Choose flexible monthly payments as low as 0% APR. You'll be redirected to Affirm to complete your purchase.
          </p>
        </div>
      )}

      {/* Name and Email fields for Klarna and Affirm */}
      {(selectedPaymentMethod === 'klarna' || selectedPaymentMethod === 'affirm' || selectedPaymentMethod === 'afterpay') && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h4 className="font-bold text-gray-900 mb-4">Customer Information</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="customer-name"
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="h-11"
                />
              </div>
              <div>
                <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="customer-email"
                  type="email"
                  value={billingAddress.email}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  className="h-11"
                />
              </div>
              <div>
                <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="billing-address"
                  type="text"
                  value={billingAddress.line1}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, line1: e.target.value }))}
                  placeholder="123 Main St"
                  required
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="billing-city"
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    required
                    className="h-11"
                  />
                </div>
                <div>
                  <label htmlFor="billing-state" className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="billing-state"
                    type="text"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="NC"
                    maxLength={2}
                    required
                    className="h-11"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="billing-zip" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="billing-zip"
                  type="text"
                  value={billingAddress.postal_code}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="12345"
                  required
                  className="h-11 w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Klarna Payment Information */}
      {selectedPaymentMethod === 'klarna' && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-semibold text-amber-700 flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              Klarna Full Payment Required
            </h4>
            <p className="text-amber-700 text-sm mb-1">
              <strong>Full Payment:</strong> ${currentPaymentAmount.toFixed(2)} total (no remaining balance)
            </p>
            <p className="text-amber-600 text-sm">
              Klarna will allow you to pay in 4 interest-free installments, but the full service amount is processed upfront.
            </p>
          </div>
          
          {/* Klarna Pre-approval Check */}
          <Card className="border-amber-300 border-2">
            <CardContent className="p-6">
              <h4 className="font-semibold text-amber-600 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5" />
                Klarna Pre-approval Required
              </h4>
              <p className="text-gray-700 mb-4">
                Have you been approved by Klarna for the full amount of <strong>${currentPaymentAmount.toFixed(2)}</strong>?
              </p>
              
              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="klarnaApproval"
                    checked={klarnaApproved === true}
                    onChange={() => setKlarnaApproved(true)}
                    className="w-4 h-4 text-[#AD6269] border-gray-300 focus:ring-[#AD6269]"
                  />
                  <span className="text-gray-700">Yes, I have been approved by Klarna for this amount</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="klarnaApproval"
                    checked={klarnaApproved === false}
                    onChange={() => setKlarnaApproved(false)}
                    className="w-4 h-4 text-[#AD6269] border-gray-300 focus:ring-[#AD6269]"
                  />
                  <span className="text-gray-700">No, I need to get approved first</span>
                </label>
              </div>
              
              {klarnaApproved === false && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="font-semibold text-amber-700 mb-2">You need Klarna approval before proceeding.</p>
                  <p className="text-amber-600 text-sm mb-3">
                    Please visit Klarna to create an account and get approved for the full amount:
                  </p>
                  <Button
                    asChild
                    className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                  >
                    <a href="https://www.klarna.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Get Approved at Klarna.com
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Affirm Payment Information */}
      {selectedPaymentMethod === 'affirm' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-700 flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              Affirm Full Payment Required
            </h4>
            <p className="text-blue-700 text-sm mb-1">
              <strong>Full Payment:</strong> ${currentPaymentAmount.toFixed(2)} total (no remaining balance)
            </p>
            <p className="text-blue-600 text-sm">
              Affirm offers monthly payment plans with rates as low as 0% APR, but the full service amount is processed upfront.
            </p>
          </div>
          
          {/* Affirm Pre-approval Check */}
          <Card className="border-blue-300 border-2">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5" />
                Affirm Pre-approval Required
              </h4>
              <p className="text-gray-700 mb-4">
                Have you been approved by Affirm for the full amount of <strong>${currentPaymentAmount.toFixed(2)}</strong>?
              </p>
              
              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="affirmApproval"
                    checked={affirmApproved === true}
                    onChange={() => setAffirmApproved(true)}
                    className="w-4 h-4 text-[#AD6269] border-gray-300 focus:ring-[#AD6269]"
                  />
                  <span className="text-gray-700">Yes, I have been approved by Affirm for this amount</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="affirmApproval"
                    checked={affirmApproved === false}
                    onChange={() => setAffirmApproved(false)}
                    className="w-4 h-4 text-[#AD6269] border-gray-300 focus:ring-[#AD6269]"
                  />
                  <span className="text-gray-700">No, I need to get approved first</span>
                </label>
              </div>
              
              {affirmApproved === false && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-700 mb-2">You need Affirm approval before proceeding.</p>
                  <p className="text-blue-600 text-sm mb-3">
                    Please visit Affirm to create an account and get approved for the full amount:
                  </p>
                  <Button
                    asChild
                    className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                  >
                    <a href="https://www.affirm.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Get Approved at Affirm.com
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Cherry Payment Information */}
      {selectedPaymentMethod === 'cherry' && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-6">
            <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5" />
              Cherry Payment Process
            </h4>
            <p className="text-gray-700 mb-3">Cherry requires full payment upfront with flexible payment plans. Here's what happens next:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm mb-4">
              <li><strong>Get Pre-Approved:</strong> Click "Continue with Cherry" to get pre-approved for the full amount</li>
              <li><strong>Book Your Appointment:</strong> Contact us directly to schedule your treatment</li>
              <li><strong>Say "I'm paying with Cherry":</strong> When booking, mention you'll use Cherry financing</li>
              <li><strong>Secure Checkout:</strong> We'll send you a secure checkout link to complete full payment</li>
              <li><strong>Select Payment Plan:</strong> Choose your preferred payment plan and pay the initial down payment</li>
            </ol>
            <div className="bg-white/70 rounded-lg p-3 space-y-1">
              <p className="text-red-600 font-semibold text-sm">
                Full Payment Required: ${currentPaymentAmount.toFixed(2)} total (no remaining balance)
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Contact us:</strong> Call or text to book your appointment after Cherry approval.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Address (for Card, Klarna and Affirm only) */}
      {selectedPaymentMethod !== 'cherry' && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h4 className="font-bold text-gray-900 mb-4">Billing Address</h4>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="address-line1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="address-line1"
                  type="text"
                  value={billingAddress.line1}
                  onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                  placeholder="Address line 1"
                  required
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label htmlFor="address-city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="address-city"
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                    placeholder="City"
                    required
                    className="h-11"
                  />
                </div>

                <div>
                  <label htmlFor="address-state" className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="address-state"
                    type="text"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                    placeholder="NC"
                    maxLength={2}
                    required
                    className="h-11"
                  />
                </div>

                <div>
                  <label htmlFor="address-zip" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="address-zip"
                    type="text"
                    value={billingAddress.postal_code}
                    onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                    placeholder="12345"
                    required
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing || loading || !isFormValid}
        className="w-full py-6 text-lg bg-[#AD6269] hover:bg-[#9d5860] gap-2"
      >
        {processing || loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : selectedPaymentMethod === 'klarna' ? (
          `Pay Full Amount with Klarna - $${currentPaymentAmount.toFixed(2)}`
        ) : selectedPaymentMethod === 'affirm' ? (
          `Pay Full Amount with Affirm - $${currentPaymentAmount.toFixed(2)}`
        ) : selectedPaymentMethod === 'cherry' ? (
          `Continue with Cherry - Full Payment Required`
        ) : (
          `Pay $${currentPaymentAmount.toFixed(2)}`
        )}
      </Button>

      <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
        <Lock className="w-4 h-4" />
        Your payment information is secure and encrypted
      </p>
    </form>
  );
}
