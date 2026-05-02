import { NextRequest, NextResponse } from 'next/server';
import { ResendEmailService } from '@/services/resendEmailService';


export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Contact form API endpoint',
    method: 'This endpoint only accepts POST requests',
    usage: 'Submit the contact form to send a POST request'
  });
}

export async function POST(request: NextRequest) {
  console.log('=== Contact Form API Called ===');
  
  try {
    const body = await request.json();
    const { name, email, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Check if Resend is configured
    const resendConfigured = !!process.env.RESEND_API_KEY;
    if (!resendConfigured) {
      console.log('⚠️ RESEND_API_KEY not configured, logging contact only');
      console.log('Contact logged:', {
        timestamp: new Date().toISOString(),
        name, email, phone, service, message, emailSent: false
      });
      return NextResponse.json({
        success: true,
        message: 'Message logged. Email service not configured.'
      });
    }

    let emailSent = false;
    
    // Send notification email to business
    console.log('Sending notification email via Resend...');
    const notificationResult = await ResendEmailService.sendEmail(
      'victoria@aprettygirlmatter.com',
      {
        subject: `New Contact Form Submission from ${name}`,
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Service:</strong> ${service || 'Not specified'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p>Reply to: ${email}</p>
        `,
        textContent: `New Contact Form Submission
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Service: ${service || 'Not specified'}
Message: ${message}
Reply to: ${email}`
      },
      undefined, // fromEmail - use default
      ['brianstittsr@gmail.com'], // cc
      undefined, // bcc
      email // replyTo
    );

    if (notificationResult.success) {
      console.log('✅ Notification email sent successfully');
      
      // Send confirmation email to user
      console.log('Sending confirmation email via Resend...');
      const confirmationResult = await ResendEmailService.sendEmail(
        email,
        {
          subject: 'Thank you for contacting A Pretty Girl Matter!',
          htmlContent: `
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
          `,
          textContent: `Thank You, ${name}!
We've received your message and will get back to you within 24 hours.

What's Next?
Victoria will personally review your message and respond with detailed information about your inquiry.

Need immediate assistance?
Call or text us at (919) 441-0932

A Pretty Girl Matter
4040 Barrett Drive Suite 3, Raleigh, NC 27609
victoria@aprettygirlmatter.com | (919) 441-0932`
        }
      );

      if (confirmationResult.success) {
        console.log('✅ Confirmation email sent successfully');
        emailSent = true;
      } else {
        console.error('❌ Confirmation email failed:', confirmationResult.error);
      }
    } else {
      console.error('❌ Notification email failed:', notificationResult.error);
    }

    // Always log the contact
    console.log('Contact logged:', {
      timestamp: new Date().toISOString(),
      name, email, phone, service, message, emailSent
    });

    return NextResponse.json({ 
      success: true, 
      message: emailSent 
        ? 'Message sent successfully! We will respond within 24 hours.'
        : 'Message received and logged. We will respond within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form. Please call (919) 441-0932.' },
      { status: 500 }
    );
  }
}
