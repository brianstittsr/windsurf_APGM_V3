/**
 * Fix Common Issues Script
 * This script helps address common issues with the APGM website.
 * It runs a series of diagnostics and fixes, particularly for:
 * 1. Firebase Admin initialization
 * 2. User profile issues (missing profiles)
 * 3. GoHighLevel integration issues
 */

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword, 
  connectAuthEmulator
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask a question and return the answer
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main function
async function fixCommonIssues() {
  console.log('🔧 APGM Website Issue Fixer 🔧');
  console.log('--------------------------------');
  console.log('This script will help diagnose and fix common issues.');
  console.log('');

  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('Firebase initialized successfully.');
    console.log('');

    // Display main menu
    let exitRequested = false;
    while (!exitRequested) {
      console.log('\nWhat would you like to do?');
      console.log('1. Create/fix admin profile for Victoria');
      console.log('2. Set up GoHighLevel integration');
      console.log('3. Check for missing user profiles');
      console.log('4. Run all diagnostics');
      console.log('0. Exit');
      
      const choice = await askQuestion('\nEnter your choice (0-4): ');
      
      switch (choice) {
        case '1':
          await fixVictoriaAdminProfile(auth, db);
          break;
        case '2':
          await setupGHLIntegration(db);
          break;
        case '3':
          await checkForMissingProfiles(db);
          break;
        case '4':
          await runAllDiagnostics(auth, db);
          break;
        case '0':
          exitRequested = true;
          break;
        default:
          console.log('Invalid choice. Please try again.');
      }
    }

    console.log('\nThank you for using the APGM Website Issue Fixer!');
    rl.close();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    rl.close();
  }
}

// Fix Victoria's admin profile
async function fixVictoriaAdminProfile(auth, db) {
  console.log('\n🔍 Fixing Admin Profile for Victoria...');
  
  // Check for existing user account
  try {
    // Get Victoria's email
    const victoriaEmail = await askQuestion('Enter Victoria\'s email (default: victoria@aprettygirlmatter.com): ') || 'victoria@aprettygirlmatter.com';
    
    // Search for user with this email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('profile.email', '==', victoriaEmail));
    const querySnapshot = await getDocs(q);
    
    // If user found, check profile
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      console.log(`Found user document for ${victoriaEmail} with ID: ${userId}`);
      console.log(`Current role: ${userData.role || 'none'}`);
      
      // Update to admin role if needed
      if (userData.role !== 'admin') {
        const updateAdmin = await askQuestion('User is not an admin. Set as admin? (y/n): ');
        if (updateAdmin.toLowerCase() === 'y') {
          await setDoc(doc(db, 'users', userId), {
            ...userData,
            role: 'admin',
            'profile.updatedAt': serverTimestamp()
          }, { merge: true });
          console.log('✅ Updated to admin role successfully!');
        }
      } else {
        console.log('✅ User is already an admin.');
      }
      
      return;
    }
    
    // User not found, need to create account
    console.log(`No user found with email ${victoriaEmail}`);
    const createUser = await askQuestion('Would you like to create an admin account for this email? (y/n): ');
    
    if (createUser.toLowerCase() === 'y') {
      // Ask for Victoria's UID
      const victoriaUid = await askQuestion('Enter Victoria\'s Firebase Auth UID: ');
      
      if (!victoriaUid) {
        console.log('❌ UID is required to create user document.');
        return;
      }
      
      // Create admin profile
      const userDocRef = doc(db, 'users', victoriaUid);
      const newProfile = {
        role: 'admin',
        isActive: true,
        profile: {
          firstName: 'Victoria',
          lastName: 'Escobar',
          email: victoriaEmail,
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
      
      await setDoc(userDocRef, newProfile);
      console.log('✅ Created admin profile successfully!');
    }
  } catch (error) {
    console.error('Error fixing admin profile:', error);
  }
}

// Set up GoHighLevel integration
async function setupGHLIntegration(db) {
  console.log('\n🔍 Setting up GoHighLevel Integration...');
  
  try {
    // Check if crmSettings already exists
    const crmSettingsRef = doc(db, 'crmSettings', 'gohighlevel');
    const docSnap = await getDoc(crmSettingsRef);
    
    if (docSnap.exists()) {
      console.log('crmSettings document already exists:');
      const existingData = docSnap.data();
      console.log(`API Key: ${existingData.apiKey ? '********' + existingData.apiKey.substring(existingData.apiKey.length - 5) : 'Not set'}`);
      console.log(`Location ID: ${existingData.locationId || 'Not set'}`);
      
      const updateSettings = await askQuestion('Update existing settings? (y/n): ');
      if (updateSettings.toLowerCase() !== 'y') {
        return;
      }
    }
    
    // Get new settings
    const apiKey = await askQuestion('Enter your GoHighLevel API Key: ');
    const locationId = await askQuestion('Enter your GoHighLevel Location ID (optional): ');
    
    if (!apiKey) {
      console.log('❌ API Key is required.');
      return;
    }
    
    // Save to Firestore
    await setDoc(crmSettingsRef, {
      apiKey,
      ...(locationId && { locationId }),
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    console.log('✅ GoHighLevel settings saved successfully!');
    console.log('\nREMINDER: Make sure your Firestore rules allow access to crmSettings collection:');
    console.log(`
match /crmSettings/{document} {
  allow read: if request.auth != null;
}
`);
  } catch (error) {
    console.error('Error setting up GoHighLevel integration:', error);
  }
}

// Check for missing user profiles
async function checkForMissingProfiles(db) {
  console.log('\n🔍 Checking for missing user profiles...');
  
  try {
    // Get all users
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    console.log(`Found ${querySnapshot.size} user documents in Firestore.`);
    
    // Check each user for missing profile fields
    let missingProfiles = 0;
    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      const hasProfile = userData.profile && 
                         userData.profile.firstName && 
                         userData.profile.lastName && 
                         userData.profile.email;
      
      if (!hasProfile) {
        missingProfiles++;
        console.log(`⚠️ User ${userId} has missing profile information.`);
        console.log(`   Email: ${userData.profile?.email || 'Missing'}`);
        
        const fixProfile = await askQuestion('Fix this profile? (y/n): ');
        if (fixProfile.toLowerCase() === 'y') {
          // Get user information
          const firstName = await askQuestion('Enter first name: ') || 'Unknown';
          const lastName = await askQuestion('Enter last name: ') || 'User';
          const email = await askQuestion('Enter email: ') || userData.profile?.email || `user-${userId}@example.com`;
          
          // Update profile
          await setDoc(doc(db, 'users', userId), {
            ...userData,
            profile: {
              ...(userData.profile || {}),
              firstName,
              lastName,
              email,
              updatedAt: Timestamp.now(),
              createdAt: userData.profile?.createdAt || Timestamp.now(),
              phone: userData.profile?.phone || '',
              dateOfBirth: userData.profile?.dateOfBirth || '',
              address: userData.profile?.address || '',
              city: userData.profile?.city || '',
              state: userData.profile?.state || '',
              zipCode: userData.profile?.zipCode || '',
              emergencyContactName: userData.profile?.emergencyContactName || '',
              emergencyContactPhone: userData.profile?.emergencyContactPhone || '',
              preferredContactMethod: userData.profile?.preferredContactMethod || 'email',
              hearAboutUs: userData.profile?.hearAboutUs || ''
            }
          }, { merge: true });
          console.log('✅ Profile updated successfully!');
        }
      }
    }
    
    if (missingProfiles === 0) {
      console.log('✅ All users have complete profiles.');
    } else {
      console.log(`⚠️ Found ${missingProfiles} users with missing profile information.`);
    }
  } catch (error) {
    console.error('Error checking for missing profiles:', error);
  }
}

// Run all diagnostics
async function runAllDiagnostics(auth, db) {
  console.log('\n🔍 Running all diagnostics...');
  
  // Check Firebase config
  console.log('\n📋 Checking Firebase Configuration...');
  for (const key in firebaseConfig) {
    console.log(`${key}: ${firebaseConfig[key] ? '✓ Set' : '❌ Missing'}`);
  }
  
  // Check Firebase Admin environment variables
  console.log('\n📋 Checking Firebase Admin Environment Variables...');
  console.log(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '❌ Missing'}`);
  console.log(`FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '❌ Missing'}`);
  console.log(`FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? '✓ Set' : '❌ Missing'}`);
  
  // Check Victoria's admin profile
  console.log('\n📋 Checking Victoria\'s Admin Profile...');
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('profile.email', '==', 'victoria@aprettygirlmatter.com'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log(`Victoria's user document found with ID: ${userDoc.id}`);
      console.log(`Role: ${userData.role || 'none'} ${userData.role === 'admin' ? '✓' : '❌'}`);
    } else {
      console.log('❌ Victoria\'s user document not found.');
    }
  } catch (error) {
    console.error('Error checking Victoria\'s profile:', error);
  }
  
  // Check GHL settings
  console.log('\n📋 Checking GoHighLevel Settings...');
  try {
    const crmSettingsRef = doc(db, 'crmSettings', 'gohighlevel');
    const docSnap = await getDoc(crmSettingsRef);
    
    if (docSnap.exists()) {
      const ghlData = docSnap.data();
      console.log('crmSettings document found:');
      console.log(`API Key: ${ghlData.apiKey ? '✓ Set' : '❌ Missing'}`);
      console.log(`Location ID: ${ghlData.locationId ? '✓ Set' : '❌ Missing'}`);
    } else {
      console.log('❌ crmSettings document not found.');
    }
  } catch (error) {
    console.error('Error checking GHL settings:', error);
  }
  
  // Summary
  console.log('\n📋 Diagnostics Summary:');
  console.log('Run individual fixes for any items marked with ❌');
}

// Run the script
fixCommonIssues();
