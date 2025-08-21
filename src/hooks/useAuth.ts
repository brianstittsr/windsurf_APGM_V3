'use client';

import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { UserService } from '@/services/userService';
import { User, UserProfile } from '@/types/database';

interface AuthState {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const firebaseConfigured = isFirebaseConfigured();
    console.log('useAuth: Effect running, Firebase configured:', firebaseConfigured);
    console.log('useAuth: Environment variables:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set'
    });
    
    const checkAuthState = () => {
      // Always check for admin bypass first (works regardless of Firebase config)
      const adminEmail = localStorage.getItem('adminEmail');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      console.log('useAuth: Admin email from localStorage:', adminEmail, 'rememberMe:', rememberMe);
      
      // Only auto-login if remember me is enabled
      if (adminEmail === 'admin@example.com' && rememberMe) {
        console.log('useAuth: Creating mock admin profile');
        // Create a mock user profile for admin bypass
        const mockProfile: User = {
          id: 'admin-mock',
          profile: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            phone: '',
            dateOfBirth: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            preferredContactMethod: '',
            hearAboutUs: '',
            createdAt: new Date() as any,
            updatedAt: new Date() as any
          },
          role: 'admin',
          isActive: true
        };
        
        setAuthState({
          user: null,
          userProfile: mockProfile,
          loading: false,
          error: null
        });
        console.log('useAuth: Mock admin profile set');
        return;
      }
      
      // If no admin bypass and Firebase not configured, set unauthenticated
      if (!isFirebaseConfigured()) {
        console.log('useAuth: No admin email found and Firebase not configured, setting unauthenticated state');
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: null
        });
        return;
      }
    };

    // Initial check
    checkAuthState();

    // Listen for localStorage changes (for development mode)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminEmail') {
        console.log('useAuth: localStorage adminEmail changed, rechecking auth state');
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case localStorage was changed in the same tab
    const interval = setInterval(() => {
      const currentAdminEmail = localStorage.getItem('adminEmail');
      const currentRememberMe = localStorage.getItem('rememberMe') === 'true';
      const hasProfile = authState.userProfile !== null;
      const shouldHaveProfile = currentAdminEmail === 'admin@example.com' && currentRememberMe;
      
      console.log('useAuth: Periodic check - adminEmail:', currentAdminEmail, 'rememberMe:', currentRememberMe, 'hasProfile:', hasProfile, 'shouldHaveProfile:', shouldHaveProfile);
      
      if (hasProfile !== shouldHaveProfile) {
        console.log('useAuth: Auth state mismatch detected, rechecking');
        checkAuthState();
      }
    }, 2000);

    // Always set up cleanup regardless of Firebase config
    const cleanup = () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };

    if (!isFirebaseConfigured()) {
      return cleanup;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in, fetch their profile
          const userProfile = await UserService.getUserByEmail(firebaseUser.email!);
          setAuthState({
            user: firebaseUser,
            userProfile,
            loading: false,
            error: null
          });
        } else {
          // User is signed out
          setAuthState({
            user: null,
            userProfile: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setAuthState({
          user: firebaseUser,
          userProfile: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load user profile'
        });
      }
    });

    return () => {
      cleanup();
      unsubscribe();
    };
  }, []);

  const isAuthenticated = authState.user !== null || authState.userProfile?.role === 'admin';
  
  console.log('useAuth: Authentication state:', {
    user: authState.user ? 'Firebase user exists' : 'No Firebase user',
    userProfile: authState.userProfile ? `Profile exists (${authState.userProfile.role})` : 'No profile',
    isAuthenticated,
    loading: authState.loading
  });
  
  const getClientProfileData = useCallback(() => {
    if (!authState.userProfile) return null;
    
    const profile = authState.userProfile.profile;
    return {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      dateOfBirth: profile.dateOfBirth || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || '',
      zipCode: profile.zipCode || '',
      emergencyContactName: profile.emergencyContactName || '',
      emergencyContactPhone: profile.emergencyContactPhone || '',
      preferredContactMethod: profile.preferredContactMethod || '',
      hearAboutUs: profile.hearAboutUs || ''
    };
  }, [authState.userProfile]);

  return {
    ...authState,
    isAuthenticated,
    getClientProfileData
  };
}
