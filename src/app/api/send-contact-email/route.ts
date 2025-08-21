import { NextRequest, NextResponse } from 'next/server';


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

    // Create email content
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

    // Try multiple email sending methods
    console.log('Attempting to send emails via multiple methods...');

    // Method 1: Try Resend API via fetch
    if (process.env.RESEND_API_KEY) {
      console.log('Trying Resend API via fetch...');
      try {
        // Send notification email
        const notificationResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: ['victoria@aprettygirlmatter.com'],
            cc: ['brianstittsr@gmail.com'],
            subject: `New Contact Form Submission from ${name}`,
            html: emailToVictoria,
            reply_to: email
          }),
        });

        if (notificationResponse.ok) {
          const notificationResult = await notificationResponse.json();
          console.log('Notification email sent via Resend API:', notificationResult.id);

          // Send confirmation email
          const confirmationResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'onboarding@resend.dev',
              to: [email],
              subject: 'Thank you for contacting A Pretty Girl Matter!',
              html: confirmationEmail
            }),
          });

          if (confirmationResponse.ok) {
            const confirmationResult = await confirmationResponse.json();
            console.log('Confirmation email sent via Resend API:', confirmationResult.id);
            emailSent = true;
          } else {
            console.error('Confirmation email failed:', await confirmationResponse.text());
          }
        } else {
          console.error('Notification email failed:', await notificationResponse.text());
        }
      } catch (fetchError) {
        console.error('Resend API fetch failed:', fetchError);
        emailError = fetchError;
      }
    }

    // Method 2: Fallback to EmailJS or other service
    if (!emailSent) {
      console.log('Resend failed, trying alternative email service...');
      
      // Try sending via a webhook or alternative service
      try {
        const webhookResponse = await fetch('https://formsubmit.co/victoria@aprettygirlmatter.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            phone: phone || 'Not provided',
            service: service || 'Not specified',
            message,
            _subject: `New Contact Form Submission from ${name}`,
            _cc: 'brianstittsr@gmail.com',
            _template: 'table'
          })
        });

        if (webhookResponse.ok) {
          console.log('Email sent via FormSubmit webhook');
          emailSent = true;
        } else {
          console.error('FormSubmit webhook failed:', await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error('Webhook email failed:', webhookError);
      }
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
      method: emailSent ? 'email_service' : 'logged_only'
    };
    
    console.log('Contact form submission logged:', contactData);

    // Return response based on email success
    if (emailSent) {
      console.log('=== Contact form completed successfully with email ===');
      return NextResponse.json({ 
        success: true, 
        message: 'Message sent successfully! You should receive a confirmation email shortly.' 
      });
    } else {
      console.log('=== Contact form logged but email failed ===');
      return NextResponse.json({ 
        success: true, 
        message: 'Message received and logged. We will respond within 24 hours.',
        warning: 'Email delivery temporarily unavailable'
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
    
    return NextResponse.json(
      { 
        error: 'Failed to process contact form. Please try again or call (919) 441-0932.',
        details: {
          message: (error as Error).message,
          type: (error as Error).name,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
