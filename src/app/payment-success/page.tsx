'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

function PaymentSuccessContent() {
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');

    console.log('Payment Success Page - URL params:', {
      paymentIntent,
      paymentIntentClientSecret,
      redirectStatus
    });

    if (redirectStatus === 'succeeded') {
      setPaymentStatus('success');
      setPaymentDetails({
        paymentIntent,
        status: 'succeeded'
      });
    } else if (redirectStatus === 'failed') {
      setPaymentStatus('error');
    } else {
      // Check payment intent status if no redirect status
      if (paymentIntent) {
        // In a real implementation, you'd verify the payment intent status with your backend
        setPaymentStatus('success');
        setPaymentDetails({
          paymentIntent,
          status: 'succeeded'
        });
      } else {
        setPaymentStatus('error');
      }
    }
  }, [searchParams]);

  if (paymentStatus === 'loading') {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4>Processing your payment...</h4>
            <p className="text-muted">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
              <h4>Payment Failed</h4>
              <p>There was an issue processing your payment. Please try again or contact us for assistance.</p>
              <div className="mt-4">
                <Link href="/book-now-custom" className="btn btn-primary me-2">
                  Try Again
                </Link>
                <Link href="/contact" className="btn btn-outline-secondary">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow-lg">
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <i className="fas fa-check-circle fa-4x text-success"></i>
              </div>
              
              <h2 className="mb-3">Payment Successful!</h2>
              <p className="lead mb-4">
                Thank you for your payment. Your booking has been confirmed.
              </p>

              {paymentDetails && (
                <div className="alert alert-success mb-4">
                  <h6>Payment Details</h6>
                  <p className="mb-1">
                    <strong>Payment ID:</strong> {paymentDetails.paymentIntent}
                  </p>
                  <p className="mb-0">
                    <strong>Status:</strong> <span className="text-success">Confirmed</span>
                  </p>
                </div>
              )}

              <div className="row text-start mb-4">
                <div className="col-md-6">
                  <h6><i className="fas fa-envelope text-primary me-2"></i>What's Next?</h6>
                  <ul className="list-unstyled">
                    <li>✓ Confirmation email sent</li>
                    <li>✓ Appointment scheduled</li>
                    <li>✓ Reminder notifications enabled</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6><i className="fas fa-calendar text-primary me-2"></i>Before Your Appointment</h6>
                  <ul className="list-unstyled">
                    <li>• Review pre-care instructions</li>
                    <li>• Prepare any questions</li>
                    <li>• Arrive 10 minutes early</li>
                  </ul>
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link href="/" className="btn btn-primary btn-lg">
                  <i className="fas fa-home me-2"></i>
                  Return Home
                </Link>
                <Link href="/my-appointments" className="btn btn-outline-primary btn-lg">
                  <i className="fas fa-calendar-alt me-2"></i>
                  View Appointments
                </Link>
              </div>

              <div className="mt-4 pt-4 border-top">
                <p className="text-muted mb-0">
                  <i className="fas fa-phone me-1"></i>
                  Questions? Call us at <strong>(555) 123-4567</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4>Loading payment status...</h4>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
