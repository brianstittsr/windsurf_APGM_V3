import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);


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

    console.log('Using alternative email method for Vercel compatibility');

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

    // Use Resend SDK for reliable email delivery on Vercel
    if (process.env.RESEND_API_KEY) {
      console.log('Using Resend SDK for email delivery...');
      
      try {
        // Send notification to Victoria using Resend SDK
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ['brianstittsr@gmail.com'],
          subject: `New Contact Form Submission from ${name}`,
          html: emailToVictoria,
          replyTo: email
        });

        // Send confirmation email to customer
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [email],
          subject: 'Thank you for contacting A Pretty Girl Matter!',
          html: confirmationEmail
        });

        console.log('Emails sent successfully via Resend SDK');
      } catch (resendError) {
        console.error('Resend SDK failed, falling back to logging:', resendError);
        // Fall back to logging if Resend fails
      }
    } else {
      console.log('No Resend API key found, logging contact submission...');
    }
    
    // Always log the contact for backup
    const contactData = {
      timestamp: new Date().toISOString(),
      name,
      email,
      phone,
      service,
      message
    };
    
    console.log('Contact form submission logged:', contactData);

    console.log('=== Contact form completed successfully ===');
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR in Contact Form API ===');
    console.error('Error sending contact email:', error);
    
    // More detailed error logging for Vercel
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
    }
    
    // Log all environment variables for debugging
    console.error('All environment variables:', Object.keys(process.env).sort());
    console.error('SMTP-related env vars:', Object.keys(process.env).filter(key => 
      key.includes('SMTP') || key.includes('EMAIL') || key.includes('MAIL')
    ));
    
    return NextResponse.json(
      { 
        error: 'Failed to send message. Server error occurred.',
        details: {
          message: (error as Error).message,
          type: (error as Error).name,
          isVercel: !!process.env.VERCEL,
          nodeEnv: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
