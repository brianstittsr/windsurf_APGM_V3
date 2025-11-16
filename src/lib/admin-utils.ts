'use client';

import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { User } from '@/types/database';

/**
 * Utility function to ensure a user has an admin profile in Firestore
 * @param uid - Firebase Auth user ID
 * @param email - User email
 * @param firstName - First name
 * @param lastName - Last name
 */
export async function ensureAdminProfile(
  uid: string,
  email: string,
  firstName = 'Victoria',
  lastName = 'Escobar'
): Promise<User> {
  try {
    console.log(`🔍 Checking admin profile for ${email} (${uid})...`);
    const db = getDb();
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // User document exists, make sure they have admin role
      const userData = userDoc.data() as User;
      
      if (userData.role !== 'admin') {
        // Update to admin if not already
        console.log(`🔄 Updating ${email} to admin role...`);
        const updatedUser = {
          ...userData,
          role: 'admin',
          updatedAt: Timestamp.now()
        };
        
        await setDoc(userDocRef, updatedUser);
        console.log(`✅ User ${email} updated to admin role`);
        return updatedUser as User;
      }
      
      console.log(`✓ User ${email} is already an admin`);
      return userData as User;
    } else {
      // Create new admin profile
      console.log(`➕ Creating new admin profile for ${email}...`);
      
      const newAdminUser: User = {
        id: uid,
        email,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role: 'admin',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        profile: {
          firstName,
          lastName,
          email,
          phone: '',
          dateOfBirth: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          preferredContactMethod: 'email',
          hearAboutUs: '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      
      await setDoc(userDocRef, newAdminUser);
      console.log(`✅ New admin profile created for ${email}`);
      return newAdminUser;
    }
  } catch (error) {
    console.error('❌ Error ensuring admin profile:', error);
    throw error;
  }
}

/**
 * Debug function to print information about the current user document
 * Useful for troubleshooting issues with user profiles
 */
export async function debugUserProfile(uid: string): Promise<void> {
  try {
    console.log(`🔍 Debugging user profile for uid: ${uid}`);
    const db = getDb();
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ User document exists with data:');
      console.log('- Document ID:', userDoc.id);
      console.log('- Role:', userData.role || 'No role specified');
      console.log('- Display Name:', userData.displayName || 'Not set');
      console.log('- Email:', userData.email || 'Not set');
      
      // Check for profile object
      if (userData.profile) {
        console.log('- Profile object exists:');
        console.log('  - First Name:', userData.profile.firstName || 'Not set');
        console.log('  - Last Name:', userData.profile.lastName || 'Not set');
        console.log('  - Email:', userData.profile.email || 'Not set');
      } else {
        console.log('- No profile object found');
      }
    } else {
      console.log(`❌ No user document found for uid: ${uid}`);
    }
  } catch (error) {
    console.error('❌ Error debugging user profile:', error);
  }
}
