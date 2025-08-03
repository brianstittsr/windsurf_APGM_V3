/**
 * Test Firebase Environment Variables
 * This script checks if Firebase environment variables are properly loaded
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔥 Firebase Environment Variables Test\n');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('📋 Checking Firebase Environment Variables:');
console.log('=' .repeat(50));

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isConfigured = !!value;
  const displayValue = value ? `${value.substring(0, 20)}...` : 'NOT SET';
  
  console.log(`${isConfigured ? '✅' : '❌'} ${varName}: ${displayValue}`);
  
  if (!isConfigured) {
    allConfigured = false;
  }
});

console.log('=' .repeat(50));

if (allConfigured) {
  console.log('🎉 All Firebase environment variables are configured!');
  
  // Test the isFirebaseConfigured function
  const { isFirebaseConfigured } = require('../lib/firebase');
  const configured = isFirebaseConfigured();
  
  console.log(`🔍 isFirebaseConfigured() returns: ${configured}`);
  
  if (configured) {
    console.log('✅ Firebase should be working correctly');
  } else {
    console.log('❌ isFirebaseConfigured() returns false despite variables being set');
    console.log('🔧 This might be a client/server environment issue');
  }
} else {
  console.log('⚠️  Some Firebase environment variables are missing');
  console.log('📝 Please check your .env.local file');
}

console.log('\n🏁 Test completed!');
