import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, service, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Log environment check for debugging
    console.log('Environment check:', {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      EMAIL_HOST: !!process.env.EMAIL_HOST,
      EMAIL_PORT: !!process.env.EMAIL_PORT,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      GMAIL_USER: !!process.env.GMAIL_USER,
      GMAIL_PASS: !!process.env.GMAIL_PASS,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    });

    // Use Vercel environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };

    console.log('SMTP Config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: !!smtpConfig.user,
      pass: !!smtpConfig.pass
    });

    // Check if we have valid SMTP configuration
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
      console.error('Missing email configuration after fallbacks:', {
        host: !!smtpConfig.host,
        port: !!smtpConfig.port,
        user: !!smtpConfig.user,
        pass: !!smtpConfig.pass,
        availableEnvVars: Object.keys(process.env).filter(key => 
          key.includes('SMTP') || key.includes('EMAIL') || key.includes('GMAIL')
        )
      });
      
      // Return more specific error for production debugging
      return NextResponse.json(
        { 
          error: 'Email service not configured. Missing SMTP credentials in Vercel.',
          details: {
            message: 'Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set in Vercel Environment Variables',
            host: !!smtpConfig.host ? 'configured' : 'missing',
            port: smtpConfig.port || 'missing',
            user: !!smtpConfig.user ? 'configured' : 'missing',
            pass: !!smtpConfig.pass ? 'configured' : 'missing',
            isVercel: !!process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV || 'unknown'
          }
        },
        { status: 500 }
      );
    }

    // Create transporter using validated config
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    // Test connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully for Vercel production');
    } catch (verifyError) {
      console.error('SMTP verification failed on Vercel:', verifyError);
      return NextResponse.json(
        { 
          error: 'Email server connection failed',
          details: {
            message: (verifyError as Error).message,
            host: smtpConfig.host,
            port: smtpConfig.port,
            isVercel: !!process.env.VERCEL,
            suggestion: 'Check if SMTP credentials are correct in Vercel Environment Variables'
          }
        },
        { status: 500 }
      );
    }

    // Email content for Victoria
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #AD6269, #8B4A52); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #AD6269; margin-bottom: 5px; display: block; }
          .value { background: white; padding: 10px; border-radius: 5px; border: 1px solid #ddd; }
          .message-box { background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; min-height: 100px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>A Pretty Girl Matter - Contact Form</p>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="label">Name:</span>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <span class="label">Email:</span>
              <div class="value">${email}</div>
            </div>
            
            ${phone ? `
            <div class="field">
              <span class="label">Phone:</span>
              <div class="value">${phone}</div>
            </div>
            ` : ''}
            
            ${service ? `
            <div class="field">
              <span class="label">Service of Interest:</span>
              <div class="value">${service}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <span class="label">Message:</span>
              <div class="message-box">${message}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent from the A Pretty Girl Matter contact form.</p>
            <p>Please respond to the customer at: ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to Victoria
    await transporter.sendMail({
      from: smtpConfig.user,
      to: 'victoria@aprettygirlmatter.com',
      subject: `New Contact Form Submission from ${name}`,
      html: htmlContent,
      replyTo: email,
    });

    // Send confirmation email to customer
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting Us</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #AD6269, #8B4A52); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #AD6269; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You, ${name}!</h1>
            <p>We've received your message</p>
          </div>
          
          <div class="content">
            <p>Thank you for reaching out to A Pretty Girl Matter! We've received your message and will get back to you within 24 hours.</p>
            
            <div class="highlight">
              <strong>What's Next?</strong><br>
              Victoria will personally review your message and respond with detailed information about your inquiry.
            </div>
            
            <p><strong>In the meantime:</strong></p>
            <ul>
              <li>Follow us on Instagram <a href="https://www.instagram.com/aprettygirlmatter/">@aprettygirlmatter</a> for inspiration</li>
              <li>Check out our portfolio and client reviews</li>
              <li>Prepare any questions you might have for your consultation</li>
            </ul>
            
            <p><strong>Need immediate assistance?</strong><br>
            Call or text us at <strong>(919) 441-0932</strong></p>
          </div>
          
          <div class="footer">
            <p>A Pretty Girl Matter<br>
            4040 Barrett Drive Suite 3, Raleigh, NC 27609<br>
            victoria@aprettygirlmatter.com | (919) 441-0932</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: smtpConfig.user,
      to: email,
      subject: 'Thank you for contacting A Pretty Girl Matter!',
      html: confirmationHtml,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
