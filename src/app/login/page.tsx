'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const router = useRouter();
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
      router.push('/admin');
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
      
      // Redirect to dashboard or previous page
      router.push('/dashboard');
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
      <div className="container-fluid" style={{ paddingTop: '140px', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-lg-4 col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 text-primary fw-bold">Welcome Back</h1>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {!isFirebaseConfigured() && (
                  <div className="alert alert-info" role="alert">
                    <strong>Development Mode:</strong> Firebase not configured.<br/>
                    Use admin credentials: <code>admin@example.com</code> / <code>admin123</code>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
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
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <Link href="/forgot-password" className="text-decoration-none text-primary">
                    Forgot your password?
                  </Link>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-2">Don't have an account?</p>
                  <Link href="/register" className="btn btn-outline-primary rounded-pill">
                    Create Account
                  </Link>
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
