// Check what Stripe keys are available in environment
console.log('🔍 Checking Stripe Environment Variables...\n');

const stripeVars = {
  'STRIPE_MODE': process.env.STRIPE_MODE || 'NOT SET',
  'STRIPE_TEST_PUBLISHABLE_KEY': process.env.STRIPE_TEST_PUBLISHABLE_KEY ? 
    `${process.env.STRIPE_TEST_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET',
  'STRIPE_TEST_SECRET_KEY': process.env.STRIPE_TEST_SECRET_KEY ? 
    `${process.env.STRIPE_TEST_SECRET_KEY.substring(0, 12)}...` : 'NOT SET',
  'STRIPE_TEST_WEBHOOK_SECRET': process.env.STRIPE_TEST_WEBHOOK_SECRET ? 'SET' : 'NOT SET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 
    `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET'
};

console.log('Environment Variables:');
Object.entries(stripeVars).forEach(([key, value]) => {
  const status = value === 'NOT SET' ? '❌' : '✅';
  console.log(`${status} ${key}: ${value}`);
});

// Check if keys have correct format
if (process.env.STRIPE_TEST_PUBLISHABLE_KEY) {
  const pubKey = process.env.STRIPE_TEST_PUBLISHABLE_KEY;
  console.log(`\n🔑 Publishable Key Format: ${pubKey.startsWith('pk_test_') ? '✅ Valid' : '❌ Invalid'}`);
}

if (process.env.STRIPE_TEST_SECRET_KEY) {
  const secKey = process.env.STRIPE_TEST_SECRET_KEY;
  console.log(`🔑 Secret Key Format: ${secKey.startsWith('sk_test_') ? '✅ Valid' : '❌ Invalid'}`);
}

console.log('\n📝 To fix payment issues, ensure your .env.local contains:');
console.log('STRIPE_MODE=test');
console.log('STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...');
console.log('STRIPE_TEST_SECRET_KEY=sk_test_...');
