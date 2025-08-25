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
    let authUnsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      const sessionLogin = localStorage.getItem('sessionLogin') === 'true';
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const adminEmail = localStorage.getItem('adminEmail');
      const clientEmail = localStorage.getItem('clientEmail');

      // Development mode fallback - only if Firebase not configured
      if (!isFirebaseConfigured() && (adminEmail || clientEmail) && (sessionLogin || rememberMe)) {
        console.log('🔧 Development mode: Using localStorage auth fallback');
        const email = adminEmail || clientEmail;
        const role = adminEmail ? 'admin' : 'client';
        
        const mockProfile: User = {
          id: `${role}-mock-${Date.now()}`,
          profile: {
            firstName: role === 'admin' ? 'Admin' : 'Victoria',
            lastName: role === 'admin' ? 'User' : 'Client',
            email: email!,
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
          role: role as 'admin' | 'client',
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
      
      // Clear stale localStorage data if no current session AND no rememberMe
      if ((adminEmail || clientEmail) && !sessionLogin && !rememberMe) {
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('clientEmail');
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      // If Firebase not configured, set unauthenticated
      if (!isFirebaseConfigured()) {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: null
        });
        return;
      }

      // Firebase authentication setup
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        const { UserService } = await import('@/services/userService');
        
        authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log('🔥 Firebase user authenticated:', firebaseUser.email);
            
            try {
              // Fetch user profile from Firebase using user ID
              const userProfile = await UserService.getUserById(firebaseUser.uid);
              
              if (userProfile) {
                console.log('✅ User profile loaded from Firebase:', userProfile.profile.email);
                setAuthState({
                  user: firebaseUser,
                  userProfile: userProfile,
                  loading: false,
                  error: null
                });
              } else {
                console.log('❌ No user profile found in Firebase for:', firebaseUser.uid);
                setAuthState({
                  user: firebaseUser,
                  userProfile: null,
                  loading: false,
                  error: 'User profile not found'
                });
              }
            } catch (error) {
              console.error('❌ Error fetching user profile:', error);
              setAuthState({
                user: firebaseUser,
                userProfile: null,
                loading: false,
                error: 'Failed to load user profile'
              });
            }
          } else {
            console.log('🔥 No Firebase user authenticated');
            setAuthState({
              user: null,
              userProfile: null,
              loading: false,
              error: null
            });
          }
        });
      } catch (error) {
        console.error('❌ Firebase auth initialization error:', error);
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: 'Firebase authentication failed'
        });
      }
    };

    // Initialize authentication
    initializeAuth();

    // Listen for localStorage changes (for development mode)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminEmail' || e.key === 'clientEmail') {
        console.log('useAuth: localStorage auth changed, reinitializing');
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (authUnsubscribe) {
        authUnsubscribe();
      }
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
