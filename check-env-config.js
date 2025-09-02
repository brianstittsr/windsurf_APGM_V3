// Check if environment variables are properly configured
console.log('🔍 Environment Variables Check:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'MISSING');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING');

// Check if using demo values
const isUsingDemo = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                   process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-api-key' ||
                   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'your_project_id';

console.log('Using demo configuration:', isUsingDemo);

if (isUsingDemo) {
  console.log('\n⚠️ ISSUE FOUND: Using demo Firebase configuration');
  console.log('📝 SOLUTION: Create .env.local file with real Firebase credentials');
  console.log('📋 Template available in: env-template.txt');
}
