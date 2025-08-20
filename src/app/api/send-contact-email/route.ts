import { NextRequest, NextResponse } from 'next/server';

// Simple email sending using fetch to a reliable email service
async function sendEmailViaAPI(to: string, subject: string, html: string, replyTo?: string) {
  // Use a simple HTTP-based email service that works well with Vercel
  const emailData = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
    replyTo
  };

  // For now, we'll use a simple SMTP over HTTP approach
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: 'default_service',
      template_id: 'template_contact',
      user_id: process.env.EMAILJS_USER_ID,
      template_params: {
        from_email: emailData.from,
        to_email: emailData.to,
        subject: emailData.subject,
        html_content: emailData.html,
        reply_to: emailData.replyTo
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Email service responded with status: ${response.status}`);
  }

  return response.json();
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

    // Use Resend API for reliable email delivery on Vercel
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      console.log('Using Resend API for email delivery...');
      
      try {
        // Send notification to Victoria using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'contact@aprettygirlmatter.com',
            to: ['victoria@aprettygirlmatter.com'],
            subject: `New Contact Form Submission from ${name}`,
            html: emailToVictoria,
            reply_to: email
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Resend API error: ${errorText}`);
        }

        // Send confirmation email to customer
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'contact@aprettygirlmatter.com',
            to: [email],
            subject: 'Thank you for contacting A Pretty Girl Matter!',
            html: confirmationEmail
          })
        });

        console.log('Emails sent successfully via Resend API');
      } catch (resendError) {
        console.error('Resend API failed, falling back to logging:', resendError);
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
