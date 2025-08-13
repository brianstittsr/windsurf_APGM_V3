/**
 * Test Payment Intent Creation
 * Tests the actual payment intent API endpoint that the booking system uses
 */

const fetch = require('node-fetch');

async function testPaymentIntent() {
  console.log('🧪 Testing Payment Intent Creation...\n');
  
  const testAmount = 15000; // $150.00 in cents
  const apiUrl = 'http://localhost:3000/api/create-payment-intent';
  
  try {
    console.log(`💳 Creating payment intent for $${(testAmount / 100).toFixed(2)}...`);
    console.log(`📡 POST ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: testAmount,
        currency: 'usd'
      })
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment Intent Created Successfully!');
      console.log(`   Client Secret: ${data.client_secret?.substring(0, 20)}...`);
      console.log(`   Payment Intent ID: ${data.payment_intent_id}`);
      console.log('\n🎉 Stripe payment integration is working correctly!');
    } else {
      console.log('❌ Payment Intent Creation Failed!');
      console.log(`   Error: ${data.error}`);
      
      // Provide troubleshooting suggestions
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('1. Check that your development server is running (npm run dev)');
      console.log('2. Verify Stripe keys are in .env.local file');
      console.log('3. Restart your development server after adding environment variables');
      console.log('4. Check server console for detailed error messages');
    }
    
  } catch (error) {
    console.log('💥 Network Error!');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure your development server is running on http://localhost:3000');
    console.log('- Run: npm run dev');
  }
}

// Run the test
testPaymentIntent()
  .then(() => {
    console.log('\n🏁 Test completed!');
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
  });
