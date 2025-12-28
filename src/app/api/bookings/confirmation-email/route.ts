import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/bookings/confirmation-email
 * 
 * Send confirmation emails for bookings
 * - Client confirmation with appointment details and studio address
 * - Admin reminder to send BoldSign forms
 */
export async function POST(req: NextRequest) {
  try {
    const { type, booking, studioAddress, reminderType } = await req.json();

    if (!booking) {
      return NextResponse.json({ error: 'Booking data is required' }, { status: 400 });
    }

    // Get GHL credentials for sending emails
    const apiKey = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;

    if (!apiKey || !locationId) {
      console.warn('GHL credentials not configured, skipping email send');
      return NextResponse.json({ 
        success: false, 
        message: 'Email service not configured' 
      });
    }

    if (type === 'client') {
      // Send client confirmation email
      await sendClientConfirmationEmail(apiKey, locationId, booking, studioAddress);
    } else if (type === 'admin' && reminderType === 'boldsign_forms') {
      // Send Victoria reminder about BoldSign forms
      await sendAdminBoldSignReminder(apiKey, locationId, booking);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}

async function sendClientConfirmationEmail(
  apiKey: string,
  locationId: string,
  booking: any,
  studioAddress: string
) {
  const appointmentDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #AD6269 0%, #9d5860 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
    .details-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .details-box h3 { margin-top: 0; color: #AD6269; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; }
    .detail-value { font-weight: 600; color: #333; }
    .address-box { background: #e8f4f8; border-left: 4px solid #AD6269; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .cta-button { display: inline-block; background: #AD6269; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Appointment Confirmed!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">A Pretty Girl Matter</p>
    </div>
    <div class="content">
      <p>Dear ${booking.clientName},</p>
      <p>Great news! Your appointment has been confirmed. We're excited to see you!</p>
      
      <div class="details-box">
        <h3>📅 Appointment Details</h3>
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${booking.serviceName || 'PMU Appointment'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${appointmentDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${booking.time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Artist:</span>
          <span class="detail-value">${booking.artistName || 'Victoria'}</span>
        </div>
        ${booking.depositPaid ? `
        <div class="detail-row">
          <span class="detail-label">Deposit:</span>
          <span class="detail-value" style="color: #28a745;">✓ $${booking.depositAmount || 50} Paid</span>
        </div>
        ` : ''}
      </div>

      <div class="address-box">
        <strong>📍 Studio Location:</strong><br>
        ${studioAddress || 'Address will be provided before your appointment'}
      </div>

      <h3>📋 Before Your Appointment</h3>
      <ul>
        <li>Avoid caffeine and alcohol 24 hours before</li>
        <li>Don't take blood thinners (aspirin, ibuprofen) 48 hours before</li>
        <li>Avoid sun exposure and tanning</li>
        <li>Come with clean skin, no makeup on the treatment area</li>
        <li>You'll receive consent forms to sign before your appointment</li>
      </ul>

      <p>If you have any questions or need to reschedule, please contact us as soon as possible.</p>
      
      <p style="text-align: center;">
        <a href="https://aprettygirlmatter.com" class="cta-button">Visit Our Website</a>
      </p>
    </div>
    <div class="footer">
      <p>A Pretty Girl Matter | Premium Permanent Makeup Services</p>
      <p>© ${new Date().getFullYear()} All rights reserved</p>
    </div>
  </div>
</body>
</html>
  `;

  // First, find or create the contact
  let contactId = booking.ghlContactId;
  
  if (!contactId) {
    // Create contact if not exists
    const contactResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locationId,
        email: booking.clientEmail,
        name: booking.clientName,
        phone: booking.clientPhone
      })
    });

    if (contactResponse.ok) {
      const contactData = await contactResponse.json();
      contactId = contactData.contact?.id;
    }
  }

  if (!contactId) {
    console.warn('Could not find or create contact for email');
    return;
  }

  // Send email via GHL
  const emailResponse = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'Email',
      contactId,
      html: emailBody,
      subject: `✨ Your Appointment is Confirmed - ${appointmentDate}`
    })
  });

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    console.error('Failed to send client email via GHL:', errorText);
  } else {
    console.log('Client confirmation email sent successfully');
  }
}

async function sendAdminBoldSignReminder(
  apiKey: string,
  locationId: string,
  booking: any
) {
  const appointmentDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Victoria's email - you may want to make this configurable
  const victoriaEmail = process.env.ADMIN_EMAIL || 'victoria@aprettygirlmatter.com';

  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 10px 10px 0 0; border: 1px solid #f5c6cb; }
    .header h1 { margin: 0; font-size: 22px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
    .details-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .action-box { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #AD6269; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Action Required: Send BoldSign Forms</h1>
    </div>
    <div class="content">
      <p>Hi Victoria,</p>
      <p>A new appointment has been booked. Please send the required compliance forms via BoldSign.</p>
      
      <div class="details-box">
        <h3>📅 Appointment Details</h3>
        <p><strong>Client:</strong> ${booking.clientName}</p>
        <p><strong>Email:</strong> ${booking.clientEmail}</p>
        <p><strong>Phone:</strong> ${booking.clientPhone}</p>
        <p><strong>Service:</strong> ${booking.serviceName || 'PMU Appointment'}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
      </div>

      <div class="action-box">
        <h3>⚠️ Required Actions:</h3>
        <ol>
          <li>Send consent forms via BoldSign</li>
          <li>Send pre-care instructions</li>
          <li>Confirm deposit payment (${booking.depositMethod || 'pending'})</li>
        </ol>
      </div>

      <p style="text-align: center;">
        <a href="https://app.boldsign.com" class="cta-button" target="_blank">Open BoldSign</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Find Victoria's contact or use direct email
  // For admin notifications, we'll try to send directly
  try {
    // First try to find Victoria's contact
    const searchResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/search?locationId=${locationId}&query=${encodeURIComponent(victoriaEmail)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    let victoriaContactId = null;
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      victoriaContactId = searchData.contacts?.[0]?.id;
    }

    if (!victoriaContactId) {
      // Create Victoria as a contact if not exists
      const createResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationId,
          email: victoriaEmail,
          name: 'Victoria (Admin)',
          tags: ['admin', 'internal']
        })
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        victoriaContactId = createData.contact?.id;
      }
    }

    if (victoriaContactId) {
      // Send email via GHL
      const emailResponse = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'Email',
          contactId: victoriaContactId,
          html: emailBody,
          subject: `📋 Action Required: Send BoldSign Forms - ${booking.clientName} (${appointmentDate})`
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Failed to send admin reminder email via GHL:', errorText);
      } else {
        console.log('Admin BoldSign reminder email sent successfully');
      }
    } else {
      console.warn('Could not find or create admin contact for reminder email');
    }
  } catch (error) {
    console.error('Error sending admin reminder:', error);
  }
}
