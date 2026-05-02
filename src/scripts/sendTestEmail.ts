/**
 * Test script to send an email via Resend API
 * Usage: npx tsx src/scripts/sendTestEmail.ts [recipient-email]
 * 
 * Default recipient: brianstittsr@gmail.com
 */

import { ResendEmailService } from '@/services/resendEmailService';

async function sendTestEmail() {
  const recipient = process.argv[2] || 'brianstittsr@gmail.com';
  
  console.log('🧪 Sending test email via Resend API...');
  console.log(`   To: ${recipient}`);
  console.log();

  // Check configuration
  const configCheck = await ResendEmailService.verifyConfiguration();
  if (!configCheck.valid) {
    console.error('❌ Resend not configured:', configCheck.error);
    console.log();
    console.log('💡 To fix this:');
    console.log('   1. Get your API key from https://resend.com/api-keys');
    console.log('   2. Add to .env.local: RESEND_API_KEY=your_api_key_here');
    console.log();
    process.exit(1);
  }

  // Send test email
  const result = await ResendEmailService.sendEmail(
    recipient,
    {
      subject: '🧪 Test Email from APGM Website (Resend API)',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #AD6269, #8B4B52); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0;">🧪 Test Email</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Resend API is working!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #AD6269; margin-top: 0;">Email Configuration Test</h2>
            <p>This is a test email sent via the <strong>Resend API</strong>.</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Test Details:</h3>
              <p><strong>Sent to:</strong> ${recipient}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Service:</strong> Resend API</p>
            </div>
            
            <p>If you received this email, the Resend API integration is working correctly! 🎉</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="color: #666; font-size: 14px;">
              <strong>A Pretty Girl Matter</strong><br>
              Permanent Makeup Studio<br>
              Raleigh, NC<br>
              📧 victoria@aprettygirlmatter.com<br>
              📱 (919) 441-0932
            </p>
          </div>
        </div>
      `,
      textContent: `🧪 Test Email from APGM Website (Resend API)

This is a test email sent via the Resend API.

Test Details:
- Sent to: ${recipient}
- Timestamp: ${new Date().toISOString()}
- Service: Resend API

If you received this email, the Resend API integration is working correctly! 🎉

A Pretty Girl Matter
Permanent Makeup Studio
Raleigh, NC
victoria@aprettygirlmatter.com
(919) 441-0932`
    },
    undefined,
    ['victoria@aprettygirlmatter.com']
  );

  if (result.success) {
    console.log('✅ Test email sent successfully!');
    console.log(`   Email ID: ${result.id}`);
    console.log();
    console.log(`📧 Check ${recipient} for the test email.`);
  } else {
    console.error('❌ Failed to send test email:', result.error);
    process.exit(1);
  }
}

sendTestEmail();
