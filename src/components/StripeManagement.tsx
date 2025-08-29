'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';

interface StripeManagementProps {
  // Add any props if needed
}

interface PaymentTestResult {
  success: boolean;
  message: string;
  paymentIntentId?: string;
  amount?: number;
  timestamp: string;
}

// Credit Card Input Component
function CreditCardInput({ onCardChange, disabled, onCardReady }: { 
  onCardChange: (error: string | null) => void, 
  disabled: boolean,
  onCardReady: (cardElement: any) => void 
}) {
  const cardElementRef = useRef<any>(null);

  const handleCardChange = (event: any) => {
    if (event.error) {
      onCardChange(event.error.message);
    } else {
      onCardChange(null);
    }
  };

  const handleCardReady = (cardElement: any) => {
    cardElementRef.current = cardElement;
    onCardReady(cardElement);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        padding: '12px 16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#9e2146',
      },
      complete: {
        color: '#4caf50',
      },
    },
    disabled: disabled,
    hidePostalCode: true,
  };

  return (
    <div>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label fw-semibold">
            <i className="fas fa-credit-card me-2"></i>
            Card Number
          </label>
          <div className="border rounded p-3" style={{ backgroundColor: '#fff', minHeight: '50px' }}>
            <CardElement 
              options={cardElementOptions}
              onChange={handleCardChange}
              onReady={handleCardReady}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StripeManagement({}: StripeManagementProps) {
  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<PaymentTestResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentPaymentIntent, setCurrentPaymentIntent] = useState<string | null>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [stripeConfig, setStripeConfig] = useState({
    testPublishableKey: '',
    testSecretKey: '',
    livePublishableKey: '',
    liveSecretKey: '',
    currentMode: 'test'
  });

  // Sample products for testing
  const products = [
    { id: 'eyebrows', name: 'Eyebrow Microblading', price: 450 },
    { id: 'eyeliner', name: 'Permanent Eyeliner', price: 350 },
    { id: 'lips', name: 'Lip Blushing', price: 400 },
    { id: 'combo', name: 'Combo Package', price: 1000 },
    { id: 'touchup', name: 'Touch-up Session', price: 150 }
  ];

  useEffect(() => {
    loadStripeConfig();
  }, []);

  const loadStripeConfig = async () => {
    try {
      // Fetch current Stripe mode from API
      const modeResponse = await fetch('/api/stripe/mode');
      const modeData = await modeResponse.json();
      const currentMode = modeData.mode || 'test';
      
      setStripeMode(currentMode as 'test' | 'live');
      
      const config = {
        testPublishableKey: modeData.publishableKey || '',
        testSecretKey: '',
        livePublishableKey: modeData.publishableKey || '',
        liveSecretKey: '',
        currentMode: currentMode
      };
      
      setStripeConfig(config);
      
      // Initialize Stripe with the publishable key from API
      if (modeData.publishableKey) {
        const stripe = loadStripe(modeData.publishableKey);
        setStripePromise(stripe);
        console.log('Stripe initialized with key:', modeData.publishableKey.substring(0, 12) + '...');
      } else {
        console.error('No Stripe publishable key available');
      }
    } catch (error) {
      console.error('Error loading Stripe config:', error);
      // Fallback to environment variables
      const testKey = process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY;
      if (testKey) {
        setStripePromise(loadStripe(testKey));
        setStripeMode('test');
      }
    }
  };

  const toggleStripeMode = async () => {
    setIsLoading(true);
    try {
      const newMode = stripeMode === 'test' ? 'live' : 'test';
      
      // Save to localStorage (in production, you'd save to your backend)
      localStorage.setItem('stripeMode', newMode);
      setStripeMode(newMode);
      
      // Update the config
      setStripeConfig(prev => ({
        ...prev,
        currentMode: newMode
      }));

      // Add a test result entry
      const result: PaymentTestResult = {
        success: true,
        message: `Stripe mode switched to ${newMode.toUpperCase()}`,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      
    } catch (error) {
      console.error('Error toggling Stripe mode:', error);
      const result: PaymentTestResult = {
        success: false,
        message: `Failed to switch Stripe mode: ${error}`,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const testPayment = async () => {
    if (!selectedProduct) {
      alert('Please select a product to test payment');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      alert('Product not found');
      return;
    }

    // Show confirmation popup for live mode
    if (stripeMode === 'live') {
      const confirmed = window.confirm(
        `⚠️ LIVE PAYMENT CONFIRMATION\n\n` +
        `Selected Product: ${product.name} ($${product.price})\n` +
        `ACTUAL CHARGE: $1.00 USD\n\n` +
        `This is a $1.00 test payment, NOT the full product price.\n` +
        `Your credit card will be charged $1.00 for testing purposes.\n\n` +
        `Continue with $1.00 live payment?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    setIsProcessingPayment(true);
    try {

      // Create payment intent for $1.00 (100 cents)
      const response = await fetch('/api/create-test-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100, // $1.00 in cents
          currency: 'usd',
          productName: product.name,
          stripeMode: stripeMode,
          isTestPayment: true
        }),
      });

      const { clientSecret, paymentIntentId } = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      // Update Stripe promise if mode changed
      const publishableKey = stripeMode === 'test' 
        ? stripeConfig.testPublishableKey 
        : stripeConfig.livePublishableKey;
      
      if (publishableKey) {
        setStripePromise(loadStripe(publishableKey));
      } else {
        throw new Error('Stripe publishable key not found');
      }

      // Store payment intent for the form
      setCurrentPaymentIntent(clientSecret);
      
      const result: PaymentTestResult = {
        success: true,
        message: `Payment form ready for ${product.name} in ${stripeMode.toUpperCase()} mode`,
        paymentIntentId,
        amount: 1.00,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error('Payment test failed:', error);
      const result: PaymentTestResult = {
        success: false,
        message: `Payment test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        amount: 1.00,
        timestamp: new Date().toISOString()
      };
      setTestResults(prev => [result, ...prev.slice(0, 9)]);
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    const successResult: PaymentTestResult = {
      success: true,
      message: `Payment completed successfully! Payment ID: ${result.paymentIntentId}`,
      paymentIntentId: result.paymentIntentId,
      amount: result.amount,
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [successResult, ...prev.slice(0, 9)]);
    setCurrentPaymentIntent(null);
    setIsProcessingPayment(false);
  };

  const handlePaymentError = (error: string) => {
    const errorResult: PaymentTestResult = {
      success: false,
      message: `Payment failed: ${error}`,
      amount: 1.00,
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [errorResult, ...prev.slice(0, 9)]);
    setCurrentPaymentIntent(null);
    setIsProcessingPayment(false);
  };

  const handlePaymentCancel = () => {
    setCurrentPaymentIntent(null);
    setIsProcessingPayment(false);
  };

  const processDirectPayment = async () => {
    // Set default product if none selected
    if (!selectedProduct) {
      setSelectedProduct('eyebrows');
    }

    if (!cardElement) {
      alert('Credit card form not ready. Please wait for the form to load.');
      return;
    }

    let product = products.find(p => p.id === selectedProduct);
    if (!product) {
      // Use default product if none selected
      product = { id: 'test', name: 'Test Payment', price: 1 };
    }

    // Show confirmation popup for live mode
    if (stripeMode === 'live') {
      const confirmed = window.confirm(
        `⚠️ LIVE PAYMENT CONFIRMATION\n\n` +
        `Selected Product: ${product.name} ($${product.price})\n` +
        `ACTUAL CHARGE: $1.00 USD\n\n` +
        `This is a $1.00 test payment, NOT the full product price.\n` +
        `Your credit card will be charged $1.00 for testing purposes.\n\n` +
        `Continue with $1.00 live payment?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    setIsProcessingPayment(true);
    try {
      // Create payment intent for $1.00 (100 cents)
      const response = await fetch('/api/create-test-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100, // $1.00 in cents
          currency: 'usd',
          productName: product.name,
          stripeMode: stripeMode,
          isTestPayment: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = data;

      // Get Stripe instance and process payment with card element
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // Confirm payment with card element
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const result: PaymentTestResult = {
        success: true,
        message: `✅ Payment successful! Charged $1.00 for ${product.name}`,
        paymentIntentId: paymentIntent.id,
        amount: 1.00,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error('Payment processing failed:', error);
      const result: PaymentTestResult = {
        success: false,
        message: `❌ Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        amount: 1.00,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #AD6269 0%, #8B4A52 100%)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle me-3" style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-credit-card text-white fs-5"></i>
                  </div>
                  <div>
                    <h4 className="mb-1 text-white fw-bold">Stripe Payment Management</h4>
                    <p className="mb-0 text-white-50 small">Configure payment processing and test transactions</p>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="text-white text-center">
                    <div className="small text-white-50">Current Mode</div>
                    <div className={`badge fs-6 px-3 py-2 ${stripeMode === 'test' ? 'bg-warning' : 'bg-success'}`}>
                      <i className={`fas ${stripeMode === 'test' ? 'fa-flask' : 'fa-shield-alt'} me-2`}></i>
                      {stripeMode.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Stripe Mode Toggle */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-toggle-on me-2 text-primary"></i>
                Stripe Mode Control
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light">
                    <div>
                      <h6 className="mb-1 fw-bold">Payment Processing Mode</h6>
                      <p className="mb-0 text-muted small">
                        {stripeMode === 'test' 
                          ? 'Using test keys - no real charges will be made' 
                          : 'Using live keys - real payments will be processed'}
                      </p>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="stripeModeToggle"
                        checked={stripeMode === 'live'}
                        onChange={toggleStripeMode}
                        disabled={isLoading}
                        style={{ transform: 'scale(1.5)' }}
                      />
                      <label className="form-check-label visually-hidden" htmlFor="stripeModeToggle">
                        Toggle Stripe Mode
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="alert alert-info border-0 rounded-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Important:</strong> Make sure you have configured both test and live Stripe keys in your environment variables before switching modes.
                  </div>
                </div>

                {stripeMode === 'live' && (
                  <div className="col-12">
                    <div className="alert alert-warning border-0 rounded-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong>Live Mode Active:</strong> Real payments will be processed. Use the $1 test feature below to verify everything is working correctly.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Test Section */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-dollar-sign me-2 text-primary"></i>
                $1 Payment Test
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Select Product for Testing</label>
                  <select
                    className="form-select form-select-lg border-2 rounded-3"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (${product.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Credit Card Form Section */}
                <div className="col-12">
                  {stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <CreditCardInput 
                        onCardChange={setCardError}
                        disabled={isProcessingPayment}
                        onCardReady={setCardElement}
                      />
                    </Elements>
                  ) : (
                    <div className="border rounded p-3 bg-light text-muted">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Loading payment form...
                    </div>
                  )}
                  {cardError && (
                    <div className="text-danger small mt-2">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      {cardError}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <button
                    className="btn btn-lg w-100 rounded-pill"
                    style={{ backgroundColor: '#AD6269', borderColor: '#AD6269', color: 'white' }}
                    onClick={processDirectPayment}
                    disabled={isProcessingPayment || !!cardError}
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing $1.00 Payment...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock me-2"></i>
                        Pay $1.00 Now
                      </>
                    )}
                  </button>
                </div>

                <div className="col-12">
                  <div className="alert alert-info border-0 rounded-3 small">
                    <i className="fas fa-lightbulb me-2"></i>
                    <strong>Test Cards:</strong> Use 4242 4242 4242 4242 (any future date, any CVC) for testing. Real cards will be charged $1.00 in live mode.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Section */}
      {currentPaymentIntent && stripePromise && (
        <div className="row mt-4">
          <div className="col-12">
            <Elements stripe={stripePromise}>
              <PaymentForm
                clientSecret={currentPaymentIntent}
                amount={1.00}
                productName={products.find(p => p.id === selectedProduct)?.name || 'Test Product'}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </div>
        </div>
      )}

      {/* Test Results Section */}
      {testResults.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header border-0 bg-light py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-history me-2 text-primary"></i>
                  Test Results History
                </h5>
                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill"
                  onClick={clearTestResults}
                >
                  <i className="fas fa-trash me-1"></i>
                  Clear History
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 fw-bold">Status</th>
                        <th className="border-0 fw-bold">Message</th>
                        <th className="border-0 fw-bold">Amount</th>
                        <th className="border-0 fw-bold">Payment ID</th>
                        <th className="border-0 fw-bold">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((result, index) => (
                        <tr key={index}>
                          <td className="align-middle">
                            <span className={`badge rounded-pill ${result.success ? 'bg-success' : 'bg-danger'}`}>
                              <i className={`fas ${result.success ? 'fa-check' : 'fa-times'} me-1`}></i>
                              {result.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className="align-middle">{result.message}</td>
                          <td className="align-middle">
                            {result.amount ? `$${result.amount.toFixed(2)}` : '-'}
                          </td>
                          <td className="align-middle">
                            {result.paymentIntentId ? (
                              <code className="small">{result.paymentIntentId.substring(0, 20)}...</code>
                            ) : '-'}
                          </td>
                          <td className="align-middle">
                            {result.timestamp ? new Date(result.timestamp).toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Status */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-cog me-2 text-primary"></i>
                Configuration Status
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 rounded-3 border">
                    <h6 className="fw-bold text-warning mb-2">
                      <i className="fas fa-flask me-2"></i>
                      Test Mode Configuration
                    </h6>
                    <div className="small">
                      <div className="d-flex justify-content-between">
                        <span>Publishable Key:</span>
                        <span className={stripeConfig.testPublishableKey ? 'text-success' : 'text-danger'}>
                          <i className={`fas ${stripeConfig.testPublishableKey ? 'fa-check' : 'fa-times'}`}></i>
                          {stripeConfig.testPublishableKey ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Secret Key:</span>
                        <span className={stripeConfig.testSecretKey ? 'text-success' : 'text-danger'}>
                          <i className={`fas ${stripeConfig.testSecretKey ? 'fa-check' : 'fa-times'}`}></i>
                          {stripeConfig.testSecretKey ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded-3 border">
                    <h6 className="fw-bold text-success mb-2">
                      <i className="fas fa-shield-alt me-2"></i>
                      Live Mode Configuration
                    </h6>
                    <div className="small">
                      <div className="d-flex justify-content-between">
                        <span>Publishable Key:</span>
                        <span className={stripeConfig.livePublishableKey ? 'text-success' : 'text-danger'}>
                          <i className={`fas ${stripeConfig.livePublishableKey ? 'fa-check' : 'fa-times'}`}></i>
                          {stripeConfig.livePublishableKey ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Secret Key:</span>
                        <span className={stripeConfig.liveSecretKey ? 'text-success' : 'text-danger'}>
                          <i className={`fas ${stripeConfig.liveSecretKey ? 'fa-check' : 'fa-times'}`}></i>
                          {stripeConfig.liveSecretKey ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
