'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!isFirebaseConfigured()) {
      setError('Password reset is not available in development mode. Please contact support.');
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox and follow the instructions.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many reset attempts. Please try again later.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-vh-100 d-flex align-items-center" style={{ paddingTop: '140px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7 col-sm-9">
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-5">
                  <div className="text-center mb-5">
                    <div className="mb-4">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                           style={{ width: '80px', height: '80px', backgroundColor: '#AD6269' }}>
                        <i className="fas fa-key text-white fa-2x"></i>
                      </div>
                    </div>
                    <h2 className="fw-bold text-dark mb-2">Reset Password</h2>
                    <p className="text-muted">Enter your email address and we'll send you a link to reset your password.</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger mb-4" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="alert alert-success mb-4" role="alert">
                      <i className="fas fa-check-circle me-2"></i>
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="email" className="form-label fw-semibold text-dark">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-lg w-100 text-white fw-bold"
                      style={{ backgroundColor: '#AD6269' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending Reset Email...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Send Reset Email
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-4">
                    <Link href="/login" className="text-decoration-none" style={{ color: '#AD6269' }}>
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Login
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
