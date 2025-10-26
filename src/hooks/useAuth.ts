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
  userRole?: 'client' | 'admin' | 'artist';
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
      // Only use Firebase authentication - no mock/localStorage fallback
      if (!isFirebaseConfigured()) {
        console.error('❌ Firebase not configured. Authentication requires Firebase setup.');
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: 'Firebase authentication not configured'
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
                // Safely access email and role, accommodating both nested and flat structures.
                const userEmail = (userProfile as any).profile?.email || (userProfile as any).email;
                const userRole = (userProfile as any).role || 'client';

                console.log('✅ User profile loaded:', userEmail, 'Role:', userRole);
                setAuthState({
                  user: firebaseUser,
                  userProfile: userProfile,
                  userRole: userRole,
                  loading: false,
                  error: null
                });
              } else {
                console.log('⚠️ No user profile found for:', firebaseUser.uid);
                // Default to client role if no profile found
                setAuthState({
                  user: firebaseUser,
                  userProfile: null,
                  userRole: 'client',
                  loading: false,
                  error: null
                });
              }
            } catch (error) {
              console.error('❌ Error fetching user profile:', error);
              setAuthState({
                user: firebaseUser,
                userProfile: null,
                userRole: 'client', // Default to client role on error
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
          error: 'Firebase authentication failed to initialize'
        });
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, []);

  const isAuthenticated = authState.user !== null;
  
  
  const getClientProfileData = useCallback(() => {
    if (!authState.userProfile) return null;
    
    const profile = authState.userProfile.profile;
    return {
      emergencyContactName: profile.emergencyContactName || '',
      emergencyContactPhone: profile.emergencyContactPhone || ''
    };
  }, [authState.userProfile]);

  // Get the user's role from the userProfile if it exists
  const userRole = authState.userProfile?.role || 'client';

  return {
    ...authState,
    isAuthenticated,
    userRole,
    getClientProfileData
  };
}
