import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, getDb } from '@/lib/firebase';

export interface UserWithProfile extends User {
  profile?: {
    firstName?: string;
    lastName?: string;
    role?: string;
    phone?: string;
  };
}

export const useAuthState = () => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile data from Firestore
          const db = getDb();
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          // Add profile data to user object
          const userWithProfile = firebaseUser as UserWithProfile;
          if (userDoc.exists()) {
            userWithProfile.profile = userDoc.data() as UserWithProfile['profile'];
          }
          
          setUser(userWithProfile);
          console.log('✅ User profile loaded:', userWithProfile.email, 'Role:', userWithProfile.profile?.role || 'none');
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(firebaseUser as UserWithProfile);
        }
      } else {
        setUser(null);
        console.log('🔥 No Firebase user authenticated');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};
