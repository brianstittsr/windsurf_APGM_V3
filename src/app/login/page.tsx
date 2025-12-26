'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const serviceId = searchParams.get('service');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && wasRemembered) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Debug logging
    console.log('🔑 Login attempt for:', email);
    console.log('🔧 Firebase configured:', isFirebaseConfigured());

    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      // Trim whitespace from email and validate
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !password) {
        throw new Error('Please enter both email and password');
      }
      
      console.log('🚀 Attempting Firebase authentication...');
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      console.log('✅ Login successful:', userCredential.user.email);
      
      // Handle Remember Me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', trimmedEmail);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      // Redirect back to booking flow if coming from there, otherwise go to dashboard
      if (redirectUrl && serviceId) {
        router.push(`${redirectUrl}?step=calendar&service=${serviceId}`);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error code:', err.code);
      console.error('❌ Error message:', err.message);
      
      // Handle specific Firebase Auth errors with more helpful messages
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address. Please check your email or create a new account.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again or reset your password.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please wait a few minutes before trying again.');
          break;
        case 'auth/configuration-not-found':
          setError('Authentication service is not properly configured. Please contact support.');
          break;
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please double-check your credentials and try again. If you\'re a new user, please create an account first.');
          break;
        case 'auth/invalid-api-key':
          setError('Authentication configuration error. Please contact support.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setError(err.message || 'Login failed. Please try again or contact support if the problem persists.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center pt-36 pb-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#AD6269] mb-4">
                <i className="fas fa-user text-white text-3xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-[#AD6269] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Welcome Back
              </h1>
              <p className="text-gray-500">Sign in to your account to continue</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                <i className="fas fa-exclamation-triangle mt-0.5"></i>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Firebase Warning */}
            {!isFirebaseConfigured() && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                <i className="fas fa-exclamation-triangle mt-0.5"></i>
                <div className="text-sm">
                  <strong>Firebase Not Configured:</strong> Please configure Firebase authentication to enable login functionality.
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                  <i className="fas fa-envelope text-gray-400"></i>
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  className="h-12 border-gray-300 focus:border-[#AD6269] focus:ring-[#AD6269]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                  <i className="fas fa-lock text-gray-400"></i>
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="h-12 border-gray-300 focus:border-[#AD6269] focus:ring-[#AD6269]"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                    className="border-gray-300 data-[state=checked]:bg-[#AD6269] data-[state=checked]:border-[#AD6269]"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-[#AD6269] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#AD6269] hover:bg-[#9d5860] text-white font-semibold rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Create Account */}
            <div className="text-center space-y-4">
              <p className="text-gray-500">Don&apos;t have an account?</p>
              <Button
                asChild
                variant="outline"
                className="w-full h-12 border-[#AD6269] text-[#AD6269] hover:bg-[#AD6269]/5 font-semibold rounded-lg"
              >
                <Link href="/register">
                  <i className="fas fa-user-plus mr-2"></i>
                  Create Account
                </Link>
              </Button>
            </div>

            {/* Back to Home */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link href="/" className="text-gray-500 hover:text-[#AD6269] inline-flex items-center gap-2 text-sm">
                <i className="fas fa-arrow-left"></i>
                Back to Home
              </Link>
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="w-full max-w-md mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#AD6269] mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading login page...</p>
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
