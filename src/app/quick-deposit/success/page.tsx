'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { workflowEngine } from '@/services/bmad-workflows';

export default function QuickDepositSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const bookingId = searchParams.get('bookingId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!bookingId || !sessionId) {
      setError('Missing booking information');
      setLoading(false);
      return;
    }

    const processPayment = async () => {
      try {
        // Verify the payment was successful and update the booking
        const response = await fetch('/api/verify-deposit-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const data = await response.json();
        setBookingDetails(data.booking);
        
        // No need to manually trigger the workflow as it should be triggered by the API
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Unable to verify payment. Please contact customer support.');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [bookingId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-red-500 px-6 py-8 md:p-10 text-white">
            <h1 className="text-3xl font-bold">Payment Error</h1>
            <p className="mt-2 text-lg opacity-90">
              We encountered an issue processing your payment.
            </p>
          </div>
          <div className="p-6 md:p-10">
            <p className="text-red-600 mb-6">{error}</p>
            <p className="mb-8">
              If you believe this is an error, please contact our customer support with your booking ID: {bookingId}.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-400 px-6 py-8 md:p-10 text-white">
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="mt-2 text-lg opacity-90">
            Your deposit has been received and your special coupon code is ready.
          </p>
        </div>

        <div className="p-6 md:p-10 space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-100 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-medium text-green-800">Deposit Payment Confirmed</h2>
              <p className="text-green-700">
                We've received your $50 deposit and reserved your spot.
              </p>
            </div>
          </div>

          <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
            <h3 className="text-lg font-semibold text-purple-800">Your Booking Details</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Booking ID</dt>
                <dd className="mt-1 text-md font-medium text-gray-900">{bookingId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Service</dt>
                <dd className="mt-1 text-md font-medium text-gray-900">
                  {bookingDetails?.serviceName || 'Permanent Makeup Service'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-md font-medium text-gray-900">
                  {bookingDetails?.clientName || 'Client'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-md font-medium text-gray-900">
                  {bookingDetails?.clientEmail}
                </dd>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-purple-800">Your Coupon Code</h3>
                <p className="text-purple-600 mt-1">Use this code during your final booking</p>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-md">
                <span className="text-xl font-mono font-bold tracking-wider text-purple-800">GRANDOPEN250</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold text-sm">
                  1
                </div>
                <p className="ml-3 text-gray-700">
                  Check your email for confirmation and instructions
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold text-sm">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-gray-700">
                    Click the "Book Now" button in the top right corner (or in the mobile menu) to complete your booking
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/book"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold text-sm">
                  3
                </div>
                <p className="ml-3 text-gray-700">
                  Enter your coupon code <span className="font-medium">GRANDOPEN250</span> during checkout
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold text-sm">
                  4
                </div>
                <p className="ml-3 text-gray-700">
                  Complete your health forms and pay only $200 at your appointment (total savings: $300!)
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/"
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Return to Home
            </Link>
            <Link
              href="/book"
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Complete Your Booking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
