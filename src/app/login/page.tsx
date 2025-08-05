'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const serviceId = searchParams.get('service');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Development bypass for admin access (works even when Firebase is configured)
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Development admin bypass activated');
      localStorage.setItem('adminEmail', email);
      // Redirect back to booking flow if coming from there, otherwise go to admin
      if (redirectUrl && serviceId) {
        router.push(`${redirectUrl}?step=calendar&service=${serviceId}`);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. Please set up your environment variables.');
      setIsLoading(false);
      return;
    }

    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      
      // Redirect back to booking flow if coming from there, otherwise go to dashboard
      if (redirectUrl && serviceId) {
        router.push(`${redirectUrl}?step=calendar&service=${serviceId}`);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Firebase Auth errors
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/configuration-not-found':
          setError('Firebase Authentication is not enabled. Please enable Authentication in your Firebase console.');
          break;
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please check your credentials and try again.');
          break;
        case 'auth/invalid-api-key':
          setError('Firebase configuration error. Please check your API key.');
          break;
        default:
          setError(err.message || 'Login failed. Please try again.');
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
                        <i className="fas fa-user text-white fa-2x"></i>
                      </div>
                    </div>
                    <h1 className="h2 fw-bold mb-2" style={{ color: '#AD6269' }}>Welcome Back</h1>
                    <p className="text-muted fs-6">Sign in to your account to continue</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger border-0 rounded-3" role="alert">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {!isFirebaseConfigured() && (
                    <div className="alert alert-info border-0 rounded-3" role="alert">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-info-circle me-2 mt-1"></i>
                        <div>
                          <strong>Development Mode:</strong> Firebase not configured.<br/>
                          Use admin credentials: <code className="bg-light px-2 py-1 rounded">admin@example.com</code> / <code className="bg-light px-2 py-1 rounded">admin123</code>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="email" className="form-label fw-semibold text-dark">
                        <i className="fas fa-envelope me-2 text-muted"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg border-2 rounded-3"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email address"
                        style={{ paddingLeft: '1rem' }}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label fw-semibold text-dark">
                        <i className="fas fa-lock me-2 text-muted"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg border-2 rounded-3"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        style={{ paddingLeft: '1rem' }}
                      />
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="rememberMe" />
                          <label className="form-check-label text-muted" htmlFor="rememberMe">
                            Remember me
                          </label>
                        </div>
                        <Link href="/forgot-password" className="text-decoration-none" style={{ color: '#AD6269' }}>
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-lg w-100 rounded-3 fw-semibold py-3 mb-4"
                      style={{ backgroundColor: '#AD6269', borderColor: '#AD6269', color: 'white' }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center">
                    <div className="position-relative mb-4">
                      <hr className="my-4" />
                      <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">or</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-muted mb-3">Don't have an account?</p>
                      <Link 
                        href="/register" 
                        className="btn btn-outline-secondary btn-lg rounded-3 fw-semibold py-3 px-4"
                        style={{ borderColor: '#AD6269', color: '#AD6269' }}
                      >
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-top">
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
      </div>
      <Footer />
    </>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-7 col-sm-9">
                <div className="card shadow-lg border-0 rounded-4">
                  <div className="card-body p-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading login page...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    }>
      <LoginForm />
    </Suspense>
  );
}
