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
    console.log('useAuth: Effect running, Firebase configured:', isFirebaseConfigured());
    
    const checkAuthState = () => {
      if (!isFirebaseConfigured()) {
        // In development mode, check for admin bypass
        const adminEmail = localStorage.getItem('adminEmail');
        console.log('useAuth: Admin email from localStorage:', adminEmail);
        
        if (adminEmail === 'admin@example.com') {
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
        } else {
          console.log('useAuth: No admin email found, setting unauthenticated state');
          setAuthState({
            user: null,
            userProfile: null,
            loading: false,
            error: null
          });
        }
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
      if (!isFirebaseConfigured()) {
        const currentAdminEmail = localStorage.getItem('adminEmail');
        const hasProfile = authState.userProfile !== null;
        const shouldHaveProfile = currentAdminEmail === 'admin@example.com';
        
        if (hasProfile !== shouldHaveProfile) {
          console.log('useAuth: Auth state mismatch detected, rechecking');
          checkAuthState();
        }
      }
    }, 1000);

    if (!isFirebaseConfigured()) {
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
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

    return () => unsubscribe();
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
