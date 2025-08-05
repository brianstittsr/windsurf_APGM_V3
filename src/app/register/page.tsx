'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { UserService } from '@/services/database';

export default function Register() {
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

    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. Please set up your environment variables.');
      return;
    }

    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      // Create user account with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
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
      <div className="container-fluid" style={{ paddingTop: '140px', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 text-primary fw-bold">Create Your Account</h1>
                  <p className="text-muted">Join A Pretty Girl Matter for exclusive access</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Create a password (min 6 characters)"
                      minLength={6}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div className="mb-4 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                    />
                    <label className="form-check-label" htmlFor="agreeToTerms">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary text-decoration-none">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary text-decoration-none">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 rounded-pill"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                    <span className="fs-5 text-dark fw-medium">Already have an account?</span>
                    <Link href="/login" className="btn btn-primary rounded-pill px-4">
                      Sign In
                    </Link>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link href="/" className="text-decoration-none text-muted">
                    ← Back to Home
                  </Link>
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
