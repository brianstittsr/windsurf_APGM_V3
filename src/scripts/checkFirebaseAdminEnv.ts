console.log('🔥 Checking Firebase Admin environment variables...');
console.log('=====================================');

const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY'
];

const optionalVars = [
  'FIREBASE_STORAGE_BUCKET'
];

let allConfigured = true;

console.log('\n📋 Required Firebase Admin Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'FIREBASE_PRIVATE_KEY' ? '***CONFIGURED***' : value}`);
  } else {
    console.log(`❌ ${varName}: Not configured`);
    allConfigured = false;
  }
});

console.log('\n📋 Optional Firebase Admin Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️ ${varName}: Not configured (optional)`);
  }
});

if (allConfigured) {
  console.log('\n🎉 All Firebase Admin environment variables are configured!');
  console.log('✅ Firebase Admin SDK should work correctly');
} else {
  console.log('\n❌ Firebase Admin environment variables are missing!');
  console.log('\n🔧 To fix this, you need to:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Download the JSON file');
  console.log('4. Add these variables to your .env.local:');
  console.log('');
  console.log('FIREBASE_PROJECT_ID=your-project-id');
  console.log('FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com');
  console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  console.log('');
  console.log('Note: The private key should be on one line with \\n for line breaks');
}
