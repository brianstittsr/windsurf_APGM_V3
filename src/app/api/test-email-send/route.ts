import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  console.log('=== Test Email Send ===');
  
  try {
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
      to: 'victoria@aprettygirlmatter.com',
      subject: 'Test Email from Vercel',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email sent from Vercel at ${new Date().toISOString()}</p>
        <p>SMTP Host: ${smtpConfig.host}</p>
        <p>SMTP Port: ${smtpConfig.port}</p>
      `
    });

    console.log('Test email sent successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully to victoria@aprettygirlmatter.com',
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
