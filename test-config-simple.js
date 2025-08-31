// Simple test to verify configuration changes
const { config } = require('dotenv');
config({ path: '.env.local' });

console.log('🧪 Testing Configuration Changes\n');

// Test the intelligent mode detection logic
const hasLiveKeys = (process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')) &&
                   (process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_'));

const detectedMode = hasLiveKeys ? 'live' : 'test';

console.log('📋 Environment Variables:');
console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...' : 'Missing'}`);
console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'Missing'}`);

console.log('\n🔧 Mode Detection:');
console.log(`Has Live Keys: ${hasLiveKeys}`);
console.log(`Detected Mode: ${detectedMode}`);

if (detectedMode === 'test') {
  console.log('✅ System will use test mode - this should resolve payment initialization errors');
} else {
  console.log('⚠️ System will use live mode - ensure live keys are properly configured');
}

console.log('\n🏁 Configuration test complete');
