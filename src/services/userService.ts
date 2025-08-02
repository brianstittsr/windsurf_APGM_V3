import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, UserProfile } from '@/types/database';

export class UserService {
  private static collection = 'users';

  // Create a new user
  static async createUser(userData: Omit<User, 'id'>): Promise<string> {
    try {
      const docRef = doc(collection(db, this.collection));
      const user: User = {
        id: docRef.id,
        ...userData
      };
      
      await setDoc(docRef, user);
      console.log('User created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.collection, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, this.collection), 
        where('profile.email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data() as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, this.collection, userId);
      await updateDoc(docRef, {
        ...updates,
        'profile.updatedAt': Timestamp.now()
      });
      console.log('User updated successfully:', userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Update user role
  static async updateUserRole(userId: string, role: 'client' | 'admin' | 'artist'): Promise<void> {
    try {
      const docRef = doc(db, this.collection, userId);
      await updateDoc(docRef, {
        role: role,
        'profile.updatedAt': Timestamp.now()
      });
      console.log(`User role updated to ${role}:`, userId);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Get all users by role
  static async getUsersByRole(role: 'client' | 'admin' | 'artist'): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('role', '==', role),
        orderBy('profile.createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  // Get all active users
  static async getActiveUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('isActive', '==', true),
        orderBy('profile.createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error getting active users:', error);
      throw error;
    }
  }

  // Deactivate user (soft delete)
  static async deactivateUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, userId);
      await updateDoc(docRef, {
        isActive: false,
        'profile.updatedAt': Timestamp.now()
      });
      console.log('User deactivated:', userId);
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Activate user
  static async activateUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, userId);
      await updateDoc(docRef, {
        isActive: true,
        'profile.updatedAt': Timestamp.now()
      });
      console.log('User activated:', userId);
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  // Delete user (hard delete)
  static async deleteUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, userId);
      await deleteDoc(docRef);
      console.log('User deleted:', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Create admin user
  static async createAdminUser(email: string, profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        // If user exists, just update their role to admin
        await this.updateUserRole(existingUser.id, 'admin');
        console.log('Existing user promoted to admin:', email);
        return existingUser.id;
      }

      // Create new admin user
      const userData: Omit<User, 'id'> = {
        profile: {
          ...profile,
          email: email,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        role: 'admin',
        isActive: true
      };

      const userId = await this.createUser(userData);
      console.log('New admin user created:', email);
      return userId;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  // Get all admins
  static async getAdmins(): Promise<User[]> {
    return this.getUsersByRole('admin');
  }

  // Get all artists
  static async getArtists(): Promise<User[]> {
    return this.getUsersByRole('artist');
  }

  // Get all clients
  static async getClients(): Promise<User[]> {
    return this.getUsersByRole('client');
  }
}
