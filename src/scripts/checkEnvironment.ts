/**
 * Environment Configuration Check Script
 * Checks for missing environment variables and provides setup instructions
 */

console.log('🔍 Checking Environment Configuration...\n');

// Check Firebase Admin variables
console.log('📋 Firebase Admin Variables:');
const firebaseVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY'
];

firebaseVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configured`);
  } else {
    console.log(`❌ ${varName}: Missing`);
  }
});

// Check GHL variables
console.log('\n📋 GoHighLevel Variables:');
const ghlVars = [
  'GHL_API_KEY',
  'GHL_LOCATION_ID',
  'GHL_CALENDAR_ID'
];

ghlVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configured`);
  } else {
    console.log(`❌ ${varName}: Missing`);
  }
});

// Check Stripe variables
console.log('\n📋 Stripe Variables:');
const stripeVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

stripeVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const masked = varName.includes('SECRET') 
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value.substring(0, 20) + '...';
    console.log(`✅ ${varName}: ${masked}`);
  } else {
    console.log(`❌ ${varName}: Missing`);
  }
});

// Check Firebase Client variables
console.log('\n📋 Firebase Client Variables:');
const firebaseClientVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

firebaseClientVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configured`);
  } else {
    console.log(`❌ ${varName}: Missing`);
  }
});

console.log('\n🔧 Setup Instructions:');
console.log('1. Add missing variables to your .env.local file');
console.log('2. Restart the development server after changes');
console.log('3. Check the admin dashboard for GHL configuration');
console.log('4. Use the serviceAccountKey.json file for Firebase Admin setup');
