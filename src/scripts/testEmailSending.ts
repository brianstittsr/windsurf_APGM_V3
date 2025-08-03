/**
 * Test Email Sending Script
 * Tests invoice email delivery to verify configuration
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { InvoiceEmailService, InvoiceData } from '../services/invoiceEmailService';
import { SMTPEmailService } from '../services/gmailEmailService';

async function testEmailConfiguration() {
  console.log('📧 Testing Email Configuration...\n');

  // Check SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  console.log('SMTP Configuration:');
  console.log(`   SMTP_HOST: ${smtpHost ? '✅ Set' : '❌ Not set'}`);
  console.log(`   SMTP_PORT: ${smtpPort ? '✅ Set' : '❌ Not set'}`);
  console.log(`   SMTP_USER: ${smtpUser ? '✅ Set' : '❌ Not set'}`);
  console.log(`   SMTP_PASS: ${smtpPass ? '✅ Set' : '❌ Not set'}`);
  
  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    console.log('\n🧪 Testing SMTP connection...');
    const smtpWorks = await SMTPEmailService.testConfiguration();
    if (smtpWorks) {
      console.log('✅ SMTP configuration is working!');
    } else {
      console.log('❌ SMTP configuration failed');
    }
  }

  // Check external email service
  const apiKey = process.env.NEXT_PUBLIC_EMAIL_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_EMAIL_API_URL;
  
  console.log('\nExternal Email Service:');
  console.log(`   API_KEY: ${apiKey ? '✅ Set' : '❌ Not set'}`);
  console.log(`   API_URL: ${apiUrl ? '✅ Set' : '❌ Not set'}`);

  return smtpHost && smtpPort && smtpUser && smtpPass;
}

async function sendTestInvoice() {
  console.log('\n📧 Sending Test Invoice...\n');

  const invoiceData: InvoiceData = {
    invoiceNumber: InvoiceEmailService.generateInvoiceNumber(),
    clientName: 'Brian Stitt',
    clientEmail: 'brianstittsr@gmail.com',
    serviceName: 'Strokes Eyebrows - Email Test',
    servicePrice: 600,
    tax: 46.50,
    processingFee: 6.10,
    total: 652.60,
    depositPaid: 206.10,
    remainingBalance: 446.50,
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    appointmentTime: '10:00 AM',
    businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'A Pretty Girl Matter',
    businessPhone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(919) 441-0932',
    businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'victoria@aprettygirlmatter.com',
    businessAddress: '123 Beauty Lane, Raleigh, NC 27601',
    paymentIntentId: 'pi_test_email_' + Date.now()
  };

  const success = await InvoiceEmailService.sendInvoiceEmail(invoiceData);

  if (success) {
    console.log('\n🎉 Test invoice sent successfully!');
    console.log(`   Check your email: ${invoiceData.clientEmail}`);
    console.log(`   Invoice #: ${invoiceData.invoiceNumber}`);
  } else {
    console.log('\n❌ Failed to send test invoice');
  }

  return success;
}

async function runEmailTest() {
  console.log('🧪 Email Service Test\n');
  console.log('This will test your email configuration and send a test invoice.\n');

  // Test configuration
  const hasEmailService = await testEmailConfiguration();

  if (!hasEmailService) {
    console.log('\n⚠️  No email service configured!');
    console.log('\n📋 To enable email sending:');
    console.log('\n🔧 SMTP Setup (Your Current Configuration):');
    console.log('Add these variables to your .env.local file:');
    console.log('   SMTP_HOST=your-smtp-server.com');
    console.log('   SMTP_PORT=587 (or 465 for SSL)');
    console.log('   SMTP_USER=your-email@domain.com');
    console.log('   SMTP_PASS=your-email-password');
    console.log('\n📧 Common SMTP Settings:');
    console.log('   Gmail: smtp.gmail.com:587 (use App Password)');
    console.log('   Outlook: smtp-mail.outlook.com:587');
    console.log('   Yahoo: smtp.mail.yahoo.com:587');
    console.log('   Custom: Check with your email provider');
    console.log('\n💡 After configuration, run this test again!');
    return;
  }

  // Send test invoice
  await sendTestInvoice();
}

// Run the test
runEmailTest()
  .then(() => {
    console.log('\n🏁 Email test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Email test failed:', error);
    process.exit(1);
  });
