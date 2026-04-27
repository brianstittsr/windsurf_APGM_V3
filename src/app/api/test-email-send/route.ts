import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  console.log('=== Test Email Send ===');
  
  try {
    // Get target email from request body or use default
    const body = await request.json().catch(() => ({}));
    const targetEmail = body.email || 'victoria@aprettygirlmatter.com';
    
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    // Test actual email sending
    await transporter.sendMail({
      from: smtpConfig.user,
      to: targetEmail,
      subject: 'Test Email from APGM Platform',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email sent from the APGM platform at ${new Date().toISOString()}</p>
        <p><strong>To:</strong> ${targetEmail}</p>
        <p><strong>From:</strong> ${smtpConfig.user}</p>
        <p><strong>SMTP Host:</strong> ${smtpConfig.host}</p>
        <p><strong>SMTP Port:</strong> ${smtpConfig.port}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">If you received this email, your SMTP configuration is working correctly!</p>
      `
    });

    console.log(`Test email sent successfully to ${targetEmail}!`);
    
    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}`,
      targetEmail,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test email sending failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test email sending failed',
      details: {
        message: (error as Error).message,
        code: (error as any).code,
        command: (error as any).command
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
