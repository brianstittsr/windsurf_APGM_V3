import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';


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

    let emailSent = false;
    
    // Method 1: Try Gmail SMTP with nodemailer
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      console.log('Trying Gmail SMTP...');
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
          }
        });

        // Send notification email
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: 'victoria@aprettygirlmatter.com',
          cc: 'brianstittsr@gmail.com',
          subject: `New Contact Form Submission from ${name}`,
          html: `
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
          replyTo: email
        });

        // Send confirmation email
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: email,
          subject: 'Thank you for contacting A Pretty Girl Matter!',
          html: `
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
          `
        });

        console.log('Emails sent successfully via Gmail SMTP');
        emailSent = true;
      } catch (gmailError) {
        console.error('Gmail SMTP failed:', gmailError);
      }
    }

    // Method 2: Simple HTTP form submission (always works)
    if (!emailSent) {
      console.log('Trying simple form submission...');
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone || '');
        formData.append('service', service || '');
        formData.append('message', message);
        formData.append('_subject', `New Contact Form Submission from ${name}`);
        formData.append('_cc', 'brianstittsr@gmail.com');

        const response = await fetch('https://formsubmit.co/victoria@aprettygirlmatter.com', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          console.log('Form submitted successfully via FormSubmit');
          emailSent = true;
        }
      } catch (formError) {
        console.error('Form submission failed:', formError);
      }
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
