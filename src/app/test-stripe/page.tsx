'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  amount?: number;
  currency?: string;
  mode?: string;
  timestamp?: string;
  testDetails?: {
    description: string;
    testCard: string;
    nextSteps: string[];
  };
}

export default function TestStripePage() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingDeposit, setIsTestingDeposit] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [depositResult, setDepositResult] = useState<TestResult | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);
    
    try {
      const response = await fetch('/api/stripe/test-connection');
      const result = await response.json();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test connection'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testDeposit = async () => {
    setIsTestingDeposit(true);
    setDepositResult(null);
    
    try {
      const response = await fetch('/api/stripe/test-deposit', {
        method: 'POST'
      });
      const result = await response.json();
      setDepositResult(result);
    } catch (error) {
      setDepositResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test deposit payment'
      });
    } finally {
      setIsTestingDeposit(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">🧪 Stripe Integration Test Suite</h2>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Test your Stripe integration to ensure everything is working correctly.
                These tests only work in <strong>test mode</strong> for safety.
              </p>

              {/* Connection Test */}
              <div className="mb-4">
                <h4>1. Test API Connection</h4>
                <p className="text-muted small">
                  Verify that your Stripe API keys are configured correctly.
                </p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Testing Connection...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>

                {connectionResult && (
                  <div className={`mt-3 p-3 rounded ${connectionResult.success ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                    <h6 className={connectionResult.success ? 'text-success' : 'text-danger'}>
                      {connectionResult.success ? '✅ Connection Test Results' : '❌ Connection Failed'}
                    </h6>
                    {connectionResult.success ? (
                      <div>
                        <p><strong>Current Mode:</strong> {connectionResult.currentMode}</p>
                        <p><strong>Successful Connections:</strong> {connectionResult.summary?.successfulConnections}/{connectionResult.summary?.totalTests}</p>
                        <p><strong>Test Mode Working:</strong> {connectionResult.summary?.testModeWorking ? '✅ Yes' : '❌ No'}</p>
                        <p><strong>Live Mode Working:</strong> {connectionResult.summary?.liveModeWorking ? '✅ Yes' : '❌ No'}</p>
                      </div>
                    ) : (
                      <p className="text-danger">{connectionResult.error}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Deposit Payment Test */}
              <div className="mb-4">
                <h4>2. Test Deposit Payment</h4>
                <p className="text-muted small">
                  Simulate a successful $200 deposit payment using Stripe test cards.
                </p>
                <button 
                  className="btn btn-success"
                  onClick={testDeposit}
                  disabled={isTestingDeposit}
                >
                  {isTestingDeposit ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing Test Payment...
                    </>
                  ) : (
                    'Test $200 Deposit Payment'
                  )}
                </button>

                {depositResult && (
                  <div className={`mt-3 p-3 rounded ${depositResult.success ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                    <h6 className={depositResult.success ? 'text-success' : 'text-danger'}>
                      {depositResult.success ? '🎉 Deposit Payment Test Results' : '❌ Payment Test Failed'}
                    </h6>
                    {depositResult.success ? (
                      <div>
                        <p><strong>Amount:</strong> ${depositResult.amount} {depositResult.currency}</p>
                        <p><strong>Mode:</strong> {depositResult.mode}</p>
                        <p><strong>Description:</strong> {depositResult.testDetails?.description}</p>
                        <p><strong>Test Card Used:</strong> {depositResult.testDetails?.testCard}</p>
                        <div>
                          <strong>Next Steps:</strong>
                          <ul className="mt-2">
                            {depositResult.testDetails?.nextSteps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-danger">{depositResult.error}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-3 bg-light rounded">
                <h5>📋 Before Testing:</h5>
                <ol>
                  <li>Ensure your <code>.env.local</code> file has valid Stripe test keys</li>
                  <li>Set <code>STRIPE_MODE=test</code> in your environment</li>
                  <li>Restart your development server after adding keys</li>
                </ol>
                
                <h5 className="mt-3">🔗 Useful Links:</h5>
                <ul>
                  <li><a href="https://dashboard.stripe.com/test/dashboard" target="_blank" rel="noopener noreferrer">Stripe Test Dashboard</a></li>
                  <li><a href="https://stripe.com/docs/testing" target="_blank" rel="noopener noreferrer">Stripe Testing Guide</a></li>
                  <li><a href="/book-now-custom" className="text-decoration-none">Test Live Booking Flow</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
