// Firebase Configuration Verification Script
// Run this with: node verify-firebase.js

const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
let envVars = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.log('❌ Could not read .env.local file');
  console.log('📝 Make sure .env.local exists in your project root');
  process.exit(1);
}

console.log('🔥 Firebase Configuration Check\n');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

let allValid = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  
  if (!value) {
    console.log(`❌ ${varName}: Missing`);
    allValid = false;
  } else if (value.includes('your_') || value.includes('_here')) {
    console.log(`❌ ${varName}: Still using placeholder value`);
    allValid = false;
  } else {
    // Mask sensitive values for display
    const maskedValue = varName === 'NEXT_PUBLIC_FIREBASE_API_KEY' 
      ? value.substring(0, 10) + '...' 
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('🎉 All Firebase configuration values are set!');
  console.log('📝 Your website should now connect to Firebase properly.');
} else {
  console.log('⚠️  Some Firebase configuration values need attention.');
  console.log('📋 Please update your .env.local file with the correct values from:');
  console.log('   https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/settings/general');
}

console.log('\n🔄 After updating .env.local, restart your dev server: npm run dev');
