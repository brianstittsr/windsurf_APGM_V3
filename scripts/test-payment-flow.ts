import { StripeService } from '../src/services/stripeService';

// Mock configuration
const config = {
  stripeSecretKey: 'sk_test_12345'
};

async function testPaymentFlow() {
  process.env.STRIPE_SECRET_KEY = config.stripeSecretKey;
  
  const stripeService = new StripeService();
  
  try {
    console.log('Creating test payment intent...');
    const { clientSecret, paymentId } = await stripeService.createPaymentIntent({
      amount: 1000, // $10.00
      description: 'Test payment'
    });
    
    console.log('Success! Payment intent created:');
    console.log(`- Client Secret: ${clientSecret}`);
    console.log(`- Payment ID: ${paymentId}`);
    
  } catch (error) {
    console.error('Payment test failed:', error);
    process.exit(1);
  }
}

testPaymentFlow();
