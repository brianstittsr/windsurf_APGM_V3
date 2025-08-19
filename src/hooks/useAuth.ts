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
    if (!isFirebaseConfigured()) {
      // In development mode, check for admin bypass
      const adminEmail = localStorage.getItem('adminEmail');
      if (adminEmail === 'admin@example.com') {
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
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: null
        });
      }
      return;
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
