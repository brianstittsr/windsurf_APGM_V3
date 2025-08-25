const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp, getDoc } = require('firebase/firestore');

// Firebase config - you'll need to update this with your actual config
const firebaseConfig = {
  // Your Firebase config goes here
  // For now, we'll assume it's already configured in the environment
};

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user: admin@example.com');
    
    // Initialize Firebase (assuming it's already configured)
    const { db } = require('../lib/firebase');
    
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
    const userRef = doc(db, 'users', adminUserId);
    
    // Check if user already exists
    const existingUser = await getDoc(userRef);
    if (existingUser.exists()) {
      console.log('⚠️ Admin user already exists, updating role...');
      await setDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }, { merge: true });
    } else {
      console.log('👤 Creating new admin user...');
      await setDoc(userRef, userData);
    }

    console.log('✅ Admin user created/updated successfully!');
    console.log(`   User ID: ${adminUserId}`);
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: admin123 (for manual Firebase Auth setup)`);
    console.log(`   Role: admin`);
    
    // Verify the user was created
    const verifyUser = await getDoc(userRef);
    if (verifyUser.exists()) {
      const userData = verifyUser.data();
      console.log('✅ Verification successful!');
      console.log(`   Name: ${userData.profile.firstName} ${userData.profile.lastName}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Active: ${userData.isActive}`);
    }

    return {
      success: true,
      userId: adminUserId,
      email: 'admin@example.com',
      message: 'Admin user created successfully'
    };

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  createAdminUser()
    .then(result => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createAdminUser };
