import { NextRequest, NextResponse } from 'next/server';
import { ResendEmailService } from '@/services/resendEmailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to = 'brianstittsr@gmail.com' } = body;

    console.log('🧪 Testing Resend API...');
    console.log(`   To: ${to}`);

    // Check if Resend is configured
    const configCheck = await ResendEmailService.verifyConfiguration();
    
    if (!configCheck.valid) {
      console.error('❌ Resend not configured:', configCheck.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'RESEND_API_KEY not configured',
          details: configCheck.error
        },
        { status: 500 }
      );
    }

    // Send test email
    const result = await ResendEmailService.sendEmail(
      to,
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
                <p><strong>Sent to:</strong> ${to}</p>
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
- Sent to: ${to}
- Timestamp: ${new Date().toISOString()}
- Service: Resend API

If you received this email, the Resend API integration is working correctly! 🎉

A Pretty Girl Matter
Permanent Makeup Studio
Raleigh, NC
victoria@aprettygirlmatter.com
(919) 441-0932`
      },
      undefined, // use default from email
      ['victoria@aprettygirlmatter.com'] // cc
    );

    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`   Email ID: ${result.id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        emailId: result.id,
        recipient: to,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Test email failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: 'Failed to send test email'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Test email API error:', errorMessage);
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Resend Test API',
    usage: 'POST to /api/test-resend with JSON body { "to": "email@example.com" }'
  });
}
