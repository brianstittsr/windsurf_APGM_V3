// Firebase Services Check
// This will help identify which services need to be enabled

const fs = require('fs');
const path = require('path');

// Read .env.local file
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
  process.exit(1);
}

console.log('🔥 Firebase Services Setup Check\n');
console.log('Project ID:', envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('Project URL: https://console.firebase.google.com/u/0/project/' + envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('\n' + '='.repeat(60));

console.log('\n📋 Required Firebase Services to Enable:\n');

console.log('1. 🔐 Authentication');
console.log('   Status: ❓ Needs to be checked');
console.log('   URL: https://console.firebase.google.com/u/0/project/' + envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID + '/authentication');
console.log('   Action: Click "Get started" → Enable "Email/Password" provider');

console.log('\n2. 🗄️  Firestore Database');
console.log('   Status: ❓ Needs to be checked');
console.log('   URL: https://console.firebase.google.com/u/0/project/' + envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID + '/firestore');
console.log('   Action: Click "Create database" → Start in test mode');

console.log('\n3. 📁 Storage');
console.log('   Status: ❓ Optional for now');
console.log('   URL: https://console.firebase.google.com/u/0/project/' + envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID + '/storage');
console.log('   Action: Click "Get started" → Start in test mode');

console.log('\n' + '='.repeat(60));
console.log('\n🚨 MOST LIKELY ISSUE: Authentication not enabled');
console.log('👉 Go to the Authentication URL above and click "Get started"');
console.log('👉 Then enable "Email/Password" in the Sign-in method tab');

console.log('\n🔄 After enabling services:');
console.log('   1. Restart your dev server: npm run dev');
console.log('   2. Test registration at: http://localhost:3000/register');
console.log('   3. Test login at: http://localhost:3000/login');

console.log('\n📞 Need help? Check the FIREBASE_SETUP_GUIDE.md file');
