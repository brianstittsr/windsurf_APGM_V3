#!/usr/bin/env tsx
/**
 * Test script to verify contact form API is working
 * Run with: npm run test-contact
 */

const testContactForm = async () => {
  console.log('🧪 Testing Contact Form API...\n');

  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '919-555-0123',
    service: 'Microblading Eyebrows',
    message: 'This is a test message to verify the contact form is working properly and sending to victoria@aprettygirlmatter.com'
  };

  try {
    const response = await fetch('http://localhost:3000/api/send-contact-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log('📊 Test Results:');
    console.log('Status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      console.log('\n✅ Contact form is working!');
      if (result.info) {
        console.log('ℹ️  Note:', result.info);
        console.log('💡 Add RESEND_API_KEY to .env.local to enable email sending');
      }
      if (result.warning) {
        console.log('⚠️  Warning:', result.warning);
      }
    } else {
      console.log('\n❌ Contact form has issues:');
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }

  } catch (error) {
    console.error('\n💥 Failed to test contact form:');
    console.error('Error:', error);
    console.log('\n🔧 Make sure the development server is running:');
    console.log('   npm run dev');
  }
};

// Run the test
testContactForm();
