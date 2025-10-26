import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up admin user: admin@example.com');
    
    const adminProfile = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '(555) 000-0000',
      dateOfBirth: '1990-01-01',
      address: '123 Admin Street',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27601',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '(555) 000-0001',
      preferredContactMethod: 'email',
      hearAboutUs: 'System Administrator',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const userData = {
      profile: adminProfile,
      role: 'admin',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Create admin user document with specific ID
    const adminUserId = 'admin-user-001';
    const userRef = doc(getDb(), 'users', adminUserId);
    
    // Check if user already exists
    const existingUser = await getDoc(userRef);
    if (existingUser.exists()) {
      console.log('⚠️ Admin user already exists, updating role...');
      await setDoc(userRef, { 
        role: 'admin', 
        isActive: true,
        updatedAt: serverTimestamp() 
      }, { merge: true });
    } else {
      console.log('👤 Creating new admin user...');
      await setDoc(userRef, userData);
    }

    console.log('✅ Admin user created/updated successfully!');
    
    // Verify the user was created
    const verifyUser = await getDoc(userRef);
    if (verifyUser.exists()) {
      const userData = verifyUser.data();
      console.log('✅ Verification successful!');
      
      return NextResponse.json({
        success: true,
        message: 'Admin user setup completed',
        user: {
          id: adminUserId,
          email: 'admin@example.com',
          password: 'admin123',
          role: userData.role,
          name: `${userData.profile.firstName} ${userData.profile.lastName}`,
          isActive: userData.isActive
        },
        instructions: [
          'Admin user created in Firestore database',
          'Email: admin@example.com',
          'Password: admin123 (use this for Firebase Auth login)',
          'Role: admin',
          'You may need to manually create this user in Firebase Authentication console',
          'Or implement Firebase Auth user creation in your login system'
        ]
      });
    } else {
      throw new Error('User verification failed');
    }

  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to setup admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if admin user exists
    const adminUserId = 'admin-user-001';
    const userRef = doc(getDb(), 'users', adminUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return NextResponse.json({
        exists: true,
        user: {
          id: adminUserId,
          email: userData.profile.email,
          role: userData.role,
          name: `${userData.profile.firstName} ${userData.profile.lastName}`,
          isActive: userData.isActive
        }
      });
    } else {
      return NextResponse.json({
        exists: false,
        message: 'Admin user not found'
      });
    }
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
    return NextResponse.json(
      { error: 'Failed to check admin user' },
      { status: 500 }
    );
  }
}
