import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
  console.log('=== SMTP Connection Test ===');
  
  try {
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };

    console.log('Testing SMTP config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: !!smtpConfig.user,
      pass: !!smtpConfig.pass
    });

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      // Add connection debugging
      debug: true,
      logger: true
    });

    // Test connection only
    await transporter.verify();
    
    console.log('SMTP connection successful!');
    
    return NextResponse.json({
      success: true,
      message: 'SMTP connection verified successfully',
      config: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SMTP connection failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'SMTP connection failed',
      details: {
        message: (error as Error).message,
        code: (error as any).code,
        command: (error as any).command,
        response: (error as any).response,
        responseCode: (error as any).responseCode
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
