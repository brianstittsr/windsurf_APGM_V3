import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only when API key is available
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}


export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Contact form API endpoint',
    method: 'This endpoint only accepts POST requests',
    usage: 'Submit the contact form to send a POST request'
  });
}

export async function POST(request: NextRequest) {
  console.log('=== Contact Form API Called ===');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  
  try {
    const body = await request.json();
    console.log('Request body received:', { ...body, message: body.message?.substring(0, 50) + '...' });
    const { name, email, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    const hasResendKey = !!process.env.RESEND_API_KEY;
    console.log('Resend API key configured:', hasResendKey);

    // Create simple email content
    const emailToVictoria = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p>Please respond to: ${email}</p>
    `;

    const confirmationEmail = `
      <h2>Thank You, ${name}!</h2>
      <p>We've received your message and will get back to you within 24 hours.</p>
      <p><strong>What's Next?</strong><br>
      Victoria will personally review your message and respond with detailed information about your inquiry.</p>
      <p><strong>Need immediate assistance?</strong><br>
      Call or text us at <strong>(919) 441-0932</strong></p>
      <hr>
      <p>A Pretty Girl Matter<br>
      4040 Barrett Drive Suite 3, Raleigh, NC 27609<br>
      victoria@aprettygirlmatter.com | (919) 441-0932</p>
    `;

    let emailSent = false;
    let emailError = null;

    // Use Resend SDK for reliable email delivery
    if (hasResendKey && resend) {
      console.log('Using Resend SDK for email delivery...');
      
      try {
        // Send notification to Victoria using Resend SDK
        const victoriaEmail = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ['victoria@aprettygirlmatter.com'],
          subject: `New Contact Form Submission from ${name}`,
          html: emailToVictoria,
          replyTo: email
        });

        console.log('Victoria notification sent:', victoriaEmail.data?.id);

        // Send confirmation email to customer
        const customerEmail = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [email],
          subject: 'Thank you for contacting A Pretty Girl Matter!',
          html: confirmationEmail
        });

        console.log('Customer confirmation sent:', customerEmail.data?.id);
        emailSent = true;
        console.log('Emails sent successfully via Resend SDK');
      } catch (resendError) {
        console.error('Resend SDK failed:', resendError);
        emailError = resendError;
        
        // More detailed error logging
        if (resendError instanceof Error) {
          console.error('Resend error details:', {
            message: resendError.message,
            name: resendError.name,
            stack: resendError.stack
          });
        }
      }
    } else {
      console.log('⚠️  No Resend API key found - emails will not be sent');
      console.log('Add RESEND_API_KEY to environment variables to enable email sending');
    }
    
    // Always log the contact for backup
    const contactData = {
      timestamp: new Date().toISOString(),
      name,
      email,
      phone,
      service,
      message,
      emailSent,
      hasResendKey
    };
    
    console.log('Contact form submission logged:', contactData);

    // Return appropriate response
    if (hasResendKey && emailSent) {
      console.log('=== Contact form completed successfully with email ===');
      return NextResponse.json({ 
        success: true, 
        message: 'Message sent successfully! You should receive a confirmation email shortly.' 
      });
    } else if (hasResendKey && !emailSent) {
      console.log('=== Contact form logged but email failed ===');
      return NextResponse.json({ 
        success: true, 
        message: 'Message received and logged. We will respond within 24 hours.',
        warning: 'Email delivery temporarily unavailable'
      });
    } else {
      console.log('=== Contact form logged (no email service configured) ===');
      return NextResponse.json({ 
        success: true, 
        message: 'Message received and logged. We will respond within 24 hours.',
        info: 'Email notifications not configured'
      });
    }

  } catch (error) {
    console.error('=== CRITICAL ERROR in Contact Form API ===');
    console.error('Error processing contact form:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
    }
    
    // Check environment configuration
    const hasResendKey = !!process.env.RESEND_API_KEY;
    console.error('Environment check:', {
      hasResendKey,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process contact form. Please try again or call (919) 441-0932.',
        details: {
          message: (error as Error).message,
          type: (error as Error).name,
          timestamp: new Date().toISOString(),
          hasResendKey
        }
      },
      { status: 500 }
    );
  }
}
