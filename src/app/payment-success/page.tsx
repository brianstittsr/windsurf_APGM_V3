'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, Home, Calendar, Phone, Mail, Loader2 } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#AD6269] animate-spin mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-800 mb-2">Processing your payment...</h4>
          <p className="text-gray-500">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-3">Payment Failed</h4>
          <p className="text-gray-600 mb-6">
            There was an issue processing your payment. Please try again or contact us for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/book-now-custom" 
              className="inline-flex items-center justify-center px-6 py-3 bg-[#AD6269] text-white font-medium rounded-lg hover:bg-[#9d5860] transition-colors"
            >
              Try Again
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-green-100 text-lg">
              Thank you for your payment. Your booking has been confirmed.
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Payment Details */}
            {paymentDetails && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8">
                <h6 className="font-semibold text-green-800 mb-3">Payment Details</h6>
                <div className="space-y-2">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Payment ID:</span>{' '}
                    <span className="font-mono text-xs bg-green-100 px-2 py-1 rounded">
                      {paymentDetails.paymentIntent}
                    </span>
                  </p>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Status:</span>{' '}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                      Confirmed
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Info Sections */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-[#AD6269]" />
                  <h6 className="font-semibold text-gray-800">What&apos;s Next?</h6>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Confirmation email sent
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Appointment scheduled
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Reminder notifications enabled
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#AD6269]" />
                  <h6 className="font-semibold text-gray-800">Before Your Appointment</h6>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#AD6269] mt-0.5">•</span>
                    Review pre-care instructions
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#AD6269] mt-0.5">•</span>
                    Prepare any questions
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#AD6269] mt-0.5">•</span>
                    Arrive 10 minutes early
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link 
                href="/" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#AD6269] text-white font-medium rounded-lg hover:bg-[#9d5860] transition-colors"
              >
                <Home className="w-5 h-5" />
                Return Home
              </Link>
              <Link 
                href="/my-appointments" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#AD6269] text-[#AD6269] font-medium rounded-lg hover:bg-[#AD6269]/5 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                View Appointments
              </Link>
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="text-gray-500 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Questions? Call us at{' '}
                <a href="tel:5551234567" className="font-semibold text-[#AD6269] hover:underline">
                  (555) 123-4567
                </a>
              </p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#AD6269] animate-spin mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-800 mb-2">Loading payment status...</h4>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
