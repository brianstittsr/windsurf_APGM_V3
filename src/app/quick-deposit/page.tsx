'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ServiceService } from '@/services/database';
import { workflowEngine } from '@/services/bmad-workflows';
import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function QuickDepositPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  useEffect(() => {
    // Load available services
    const loadServices = async () => {
      setLoading(true);
      try {
        // Only load active services
        const activeServices = await ServiceService.getActiveServices();
        setServices(activeServices);
        
        // If serviceId is provided in URL and exists in services, select it
        if (serviceId && serviceId !== 'quick-deposit') {
          const service = activeServices.find(s => s.id === serviceId);
          if (service) {
            setSelectedService(service.id);
          }
        }
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Unable to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!email || !name) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      // Get selected service details
      let serviceName = "Permanent Makeup Service";
      let servicePrice = 500; // Default price
      
      if (selectedService) {
        const serviceDetails = services.find(s => s.id === selectedService);
        if (serviceDetails) {
          serviceName = serviceDetails.name;
          servicePrice = serviceDetails.price;
        }
      }

      // Create a payment session
      const response = await fetch('/api/create-deposit-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          phone,
          serviceName,
          servicePrice,
          serviceId: selectedService || 'quick-deposit',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { sessionId, bookingId } = await response.json();

      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (redirectError) {
        throw redirectError;
      }

    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Unable to process payment. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-8 md:p-10 text-white">
          <h1 className="text-3xl font-bold">Quick Deposit - Secure Your Appointment</h1>
          <p className="mt-2 text-lg opacity-90">
            Pay your $50 deposit now and receive the GRANDOPEN250 coupon ($250 value)!
          </p>
        </div>

        <div className="p-6 md:p-10 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
            <h2 className="text-xl font-semibold text-purple-800">How It Works:</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold text-sm">
                  1
                </div>
                <p className="ml-3 text-gray-700">Pay your $50 deposit to secure your appointment</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold text-sm">
                  2
                </div>
                <p className="ml-3 text-gray-700">Receive an email with your special GRANDOPEN250 coupon (worth $250)</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold text-sm">
                  3
                </div>
                <p className="ml-3 text-gray-700">
                  Use the "Book Now" button in the upper right corner (desktop) or in the mobile menu (3 lines icon) 
                  to complete your booking with the coupon code
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-600 font-bold text-sm">
                  4
                </div>
                <p className="ml-3 text-gray-700">Pay only $200 at your appointment (saving a total of $300!)</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                  Service (Optional)
                </label>
                <select
                  id="service"
                  name="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select a service (optional)</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Deposit Amount</span>
                <span className="text-lg font-bold text-gray-900">$50.00</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This deposit will be credited toward your final payment
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Pay $50 Deposit'
                )}
              </button>
            </div>
          </form>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Your $50 Deposit Includes:</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">Reserved appointment slot</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">Exclusive GRANDOPEN250 coupon code ($250 value)</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700">$50 credit towards your service</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
