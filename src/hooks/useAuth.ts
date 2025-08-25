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
    
    const checkAuthState = () => {
      // Check for admin bypass (works regardless of Firebase config)
      const adminEmail = localStorage.getItem('adminEmail');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const sessionLogin = sessionStorage.getItem('currentLogin') === 'true';
      
      
      // Only authenticate if it's a current session login (not auto-login from previous session)
      if (adminEmail === 'admin@example.com' && sessionLogin) {
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
        return;
      }

      // Check for client login in development mode
      const clientEmail = localStorage.getItem('clientEmail');
      if (clientEmail && (sessionLogin || rememberMe)) {
        // Create a mock user profile for client
        const mockProfile: User = {
          id: 'client-mock',
          profile: {
            firstName: 'Victoria',
            lastName: 'Client',
            email: clientEmail,
            phone: '(555) 123-4567',
            dateOfBirth: '1990-01-01',
            address: '123 Main St',
            city: 'Charlotte',
            state: 'NC',
            zipCode: '28202',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '(555) 987-6543',
            preferredContactMethod: 'email',
            hearAboutUs: 'Google Search',
            createdAt: new Date() as any,
            updatedAt: new Date() as any
          },
          role: 'client',
          isActive: true
        };
        
        setAuthState({
          user: null,
          userProfile: mockProfile,
          loading: false,
          error: null
        });
        return;
      }
      
      // Clear stale data if no current session
      if ((adminEmail || clientEmail) && !sessionLogin) {
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('clientEmail');
        localStorage.removeItem('rememberedEmail');
        if (!rememberMe) {
          localStorage.removeItem('rememberMe');
        }
      }
      
      // If no admin bypass and Firebase not configured, set unauthenticated
      if (!isFirebaseConfigured()) {
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

    // Disable periodic checking to prevent auto-login
    // const interval = setInterval(() => {
    //   // Periodic checking disabled to prevent automatic authentication
    // }, 2000);

    // Always set up cleanup regardless of Firebase config
    const cleanup = () => {
      window.removeEventListener('storage', handleStorageChange);
      // clearInterval(interval); // Disabled since interval is commented out
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
