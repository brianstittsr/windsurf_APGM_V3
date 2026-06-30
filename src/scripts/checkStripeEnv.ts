console.log('🔍 Checking Stripe environment variables...');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Not set');

if (!process.env.STRIPE_SECRET_KEY) {
  console.log('\n❌ Stripe secret key is not configured!');
  console.log('Please add STRIPE_SECRET_KEY to your .env.local file');
  console.log('Example: STRIPE_SECRET_KEY=sk_test_...');
} else {
  console.log('\n✅ Stripe environment variables are configured!');
  console.log('You can now run the bulk sync script.');
}
