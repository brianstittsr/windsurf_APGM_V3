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
      <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', paddingTop: '140px', paddingBottom: '60px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-5">
                  <div className="text-center mb-5">
                    <div className="mb-3">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                        <i className="fas fa-user-plus text-primary fs-2"></i>
                      </div>
                    </div>
                    <h1 className="h2 fw-bold text-dark mb-2">Create Your Account</h1>
                    <p className="text-muted fs-6">Join A Pretty Girl Matter for exclusive access to premium services</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control rounded-3"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            placeholder="First Name"
                          />
                          <label htmlFor="firstName" className="text-muted">
                            <i className="fas fa-user me-2"></i>First Name *
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control rounded-3"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            placeholder="Last Name"
                          />
                          <label htmlFor="lastName" className="text-muted">
                            <i className="fas fa-user me-2"></i>Last Name *
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-floating mt-3">
                      <input
                        type="email"
                        className="form-control rounded-3"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Email Address"
                      />
                      <label htmlFor="email" className="text-muted">
                        <i className="fas fa-envelope me-2"></i>Email Address *
                      </label>
                    </div>

                    <div className="form-floating mt-3">
                      <input
                        type="tel"
                        className="form-control rounded-3"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Phone Number"
                      />
                      <label htmlFor="phone" className="text-muted">
                        <i className="fas fa-phone me-2"></i>Phone Number *
                      </label>
                    </div>

                    <div className="form-floating mt-3">
                      <input
                        type="password"
                        className="form-control rounded-3"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Password"
                        minLength={6}
                      />
                      <label htmlFor="password" className="text-muted">
                        <i className="fas fa-lock me-2"></i>Password (min 6 characters) *
                      </label>
                    </div>

                    <div className="form-floating mt-3">
                      <input
                        type="password"
                        className="form-control rounded-3"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder="Confirm Password"
                      />
                      <label htmlFor="confirmPassword" className="text-muted">
                        <i className="fas fa-lock me-2"></i>Confirm Password *
                      </label>
                    </div>

                    <div className="mt-4">
                      <div className="form-check d-flex align-items-start">
                        <input
                          type="checkbox"
                          className="form-check-input mt-1 me-3 rounded"
                          id="agreeToTerms"
                          name="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          required
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <label className="form-check-label text-muted" htmlFor="agreeToTerms">
                          I agree to the{' '}
                          <Link href="/terms" className="text-primary text-decoration-none fw-medium">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-primary text-decoration-none fw-medium">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>

                    <div className="d-grid mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg rounded-pill py-3 fw-bold"
                        disabled={isLoading}
                        style={{ 
                          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                          border: 'none',
                          boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
                        }}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus me-2"></i>
                            Create Account
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="position-relative my-5">
                    <hr className="border-0" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #dee2e6, transparent)' }} />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                      OR
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-3">Already have an account?</p>
                    <Link 
                      href="/login" 
                      className="btn btn-outline-primary rounded-pill px-4 py-2 fw-medium"
                      style={{ borderWidth: '2px' }}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In Instead
                    </Link>
                  </div>

                  <div className="text-center mt-4">
                    <Link href="/" className="text-decoration-none text-muted d-inline-flex align-items-center">
                      <i className="fas fa-arrow-left me-2"></i>
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
        <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 col-md-8">
                <div className="card shadow-lg border-0 rounded-4">
                  <div className="card-body p-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading registration form...</p>
                  </div>
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
