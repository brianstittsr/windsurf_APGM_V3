'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, Auth } from 'firebase/auth';
import type { Auth as AuthType } from 'firebase/auth';
import { UserService } from '@/services/database';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const serviceId = searchParams.get('service');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.agreeToTerms) return 'You must agree to the terms and conditions';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
      }
      
      const authInstance = auth as AuthType;

      // Debug logging for production
      console.log('Environment check:', {
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        isConfigured: isFirebaseConfigured(),
        environment: process.env.NODE_ENV
      });

      // Check if Firebase is properly configured
      if (!isFirebaseConfigured()) {
        console.warn('Using demo Firebase configuration. This may cause authentication issues.');
        throw new Error('Firebase is not properly configured. Please check environment variables.');
      }
      
      // Create user account with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        formData.email,
        formData.password
      );

      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // Create user profile in Firestore
      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: 'client' as const,
        isActive: true,
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: false
        }
      };
      
      await UserService.createUserWithId(userCredential.user.uid, userData);

      // Redirect back to booking flow if coming from there, otherwise go to dashboard
      if (redirectUrl && serviceId) {
        router.push(`${redirectUrl}?step=calendar&service=${serviceId}`);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific Firebase Auth errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please sign in instead.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection and try again.');
          break;
        case 'auth/configuration-not-found':
          setError('Firebase Authentication is not enabled. Please enable Authentication in your Firebase console.');
          break;
        default:
          setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-36 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-4">
                      <i className="fas fa-user-plus text-[#AD6269] text-2xl"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                    <p className="text-gray-500">Join A Pretty Girl Matter for exclusive access to premium services</p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          <i className="fas fa-user mr-2 text-gray-400"></i>First Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          <i className="fas fa-user mr-2 text-gray-400"></i>Last Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        <i className="fas fa-envelope mr-2 text-gray-400"></i>Email Address *
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        <i className="fas fa-phone mr-2 text-gray-400"></i>Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        <i className="fas fa-lock mr-2 text-gray-400"></i>Password (min 6 characters) *
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Create a password"
                        minLength={6}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        <i className="fas fa-lock mr-2 text-gray-400"></i>Confirm Password *
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder="Confirm your password"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                          id="agreeToTerms"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          required
                        />
                        <span className="text-sm text-gray-600">
                          I agree to the{' '}
                          <Link href="/terms-of-service" className="text-[#AD6269] hover:underline font-medium">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy-policy" className="text-[#AD6269] hover:underline font-medium">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 bg-[#AD6269] hover:bg-[#9d5860] text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <i className="fas fa-user-plus mr-2"></i>
                          Create Account
                        </span>
                      )}
                    </button>
                  </form>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm text-gray-500">OR</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-500 mb-3">Already have an account?</p>
                    <Link 
                      href="/login" 
                      className="inline-flex items-center px-6 py-2 border-2 border-[#AD6269] text-[#AD6269] font-medium rounded-full hover:bg-[#AD6269] hover:text-white transition-all duration-200"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Sign In Instead
                    </Link>
                  </div>

                  <div className="text-center mt-6">
                    <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-36 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#AD6269] mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading registration form...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    }>
      <RegisterForm />
    </Suspense>
  );
}
