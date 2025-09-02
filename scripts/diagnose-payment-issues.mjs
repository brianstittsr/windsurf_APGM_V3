import { getStripeConfig, logStripeConfig } from '../src/lib/stripe-config.js';

console.log('🔍 Payment Intent Issues Diagnostic\n');

// Test 1: Check Stripe Configuration
console.log('=== 1. Stripe Configuration Test ===');
try {
  logStripeConfig();
  console.log('✅ Stripe configuration loaded successfully\n');
} catch (error) {
  console.error('❌ Stripe configuration error:', error.message);
  console.log('💡 This is likely the root cause of payment intent issues\n');
}

// Test 2: Environment Variables Check
console.log('=== 2. Environment Variables Check ===');
const envVars = {
  'NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
  'NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
  'STRIPE_LIVE_SECRET_KEY': process.env.STRIPE_LIVE_SECRET_KEY ? 'SET' : 'NOT SET',
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
  'STRIPE_TEST_SECRET_KEY': process.env.STRIPE_TEST_SECRET_KEY ? 'SET' : 'NOT SET'
};

Object.entries(envVars).forEach(([key, value]) => {
  const status = value === 'SET' ? '✅' : '❌';
  console.log(`${status} ${key}: ${value}`);
});

// Test 3: Key Format Validation
console.log('\n=== 3. Key Format Validation ===');
const keys = [
  { name: 'NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY', value: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY, expected: 'pk_live_' },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, expected: 'pk_live_' },
  { name: 'NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY', value: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY, expected: 'pk_test_' },
  { name: 'STRIPE_LIVE_SECRET_KEY', value: process.env.STRIPE_LIVE_SECRET_KEY, expected: 'sk_live_' },
  { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY, expected: 'sk_live_' },
  { name: 'STRIPE_TEST_SECRET_KEY', value: process.env.STRIPE_TEST_SECRET_KEY, expected: 'sk_test_' }
];

keys.forEach(({ name, value, expected }) => {
  if (value) {
    const isValid = value.startsWith(expected);
    const status = isValid ? '✅' : '❌';
    const preview = value.substring(0, 20) + '...';
    console.log(`${status} ${name}: ${preview} (${isValid ? 'Valid' : 'Invalid'} format)`);
  }
});

// Test 4: Mode Detection Logic
console.log('\n=== 4. Mode Detection Analysis ===');
const hasLiveKeys = !!(
  (process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) &&
  (process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY)
);

const hasTestKeys = !!(
  process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY &&
  process.env.STRIPE_TEST_SECRET_KEY
);

console.log(`Live keys available: ${hasLiveKeys ? '✅ YES' : '❌ NO'}`);
console.log(`Test keys available: ${hasTestKeys ? '✅ YES' : '❌ NO'}`);

if (hasLiveKeys) {
  console.log('🎯 System will use LIVE mode');
} else if (hasTestKeys) {
  console.log('🧪 System will use TEST mode');
} else {
  console.log('⚠️ No valid keys found - this will cause payment failures');
}

// Test 5: Common Issues Analysis
console.log('\n=== 5. Common Payment Intent Issues ===');
const issues = [];

if (!hasLiveKeys && !hasTestKeys) {
  issues.push('❌ No valid Stripe keys configured');
}

if (hasLiveKeys && hasTestKeys) {
  issues.push('⚠️ Both live and test keys present - may cause mode confusion');
}

const livePublishable = process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const liveSecret = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (livePublishable && liveSecret) {
  const pubKeyLive = livePublishable.startsWith('pk_live_');
  const secKeyLive = liveSecret.startsWith('sk_live_');
  
  if (pubKeyLive !== secKeyLive) {
    issues.push('❌ Publishable and secret keys are from different modes (live/test mismatch)');
  }
}

if (issues.length === 0) {
  console.log('✅ No obvious configuration issues detected');
} else {
  issues.forEach(issue => console.log(issue));
}

// Test 6: Recommendations
console.log('\n=== 6. Recommendations ===');
if (hasLiveKeys && !hasTestKeys) {
  console.log('✅ Production setup detected');
  console.log('💡 Ensure all live keys are from the same Stripe account');
} else if (!hasLiveKeys && hasTestKeys) {
  console.log('🧪 Development setup detected');
  console.log('💡 Good for testing - add live keys for production');
} else if (hasLiveKeys && hasTestKeys) {
  console.log('⚠️ Mixed setup detected');
  console.log('💡 Consider using only one set of keys to avoid confusion');
} else {
  console.log('❌ No valid setup detected');
  console.log('💡 Add either live or test keys to .env.local file');
}

console.log('\n🔧 Next steps:');
console.log('1. Fix any configuration issues above');
console.log('2. Restart your development server');
console.log('3. Test payment flow in browser');
console.log('4. Check browser console for Stripe initialization logs');
