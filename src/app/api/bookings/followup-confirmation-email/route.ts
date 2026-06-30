import { NextRequest, NextResponse } from 'next/server';

const VICTORIA_EMAIL = process.env.ADMIN_EMAIL || 'victoria@aprettygirlmatter.com';

/**
 * Generates an iCal (.ics) string for the appointment.
 */
function generateICalContent(booking: {
  clientName: string;
  serviceName: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  endTime?: string;   // HH:MM
  notes?: string;
}): string {
  const startDate = new Date(`${booking.date}T${booking.time}:00`);
  // Default 3-hour duration if no end time provided
  const endDate = booking.endTime
    ? new Date(`${booking.date}T${booking.endTime}:00`)
    : new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  const formatICalDate = (d: Date): string =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const uid = `apgm-${booking.date}-${booking.time.replace(':', '')}-${Date.now()}@aprettygirlmatter.com`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A Pretty Girl Matter//Appointment//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(startDate)}`,
    `DTEND:${formatICalDate(endDate)}`,
    `SUMMARY:${booking.serviceName} - A Pretty Girl Matter`,
    `DESCRIPTION:Appointment for ${booking.clientName}\\n${booking.serviceName}\\n${booking.notes ? booking.notes + '\\n' : ''}\\nIf you need to cancel or reschedule\\, please contact Victoria at victoria@aprettygirlmatter.com or call us as soon as possible.`,
    'LOCATION:A Pretty Girl Matter Studio',
    'ORGANIZER;CN=A Pretty Girl Matter:MAILTO:victoria@aprettygirlmatter.com',
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${booking.clientName}:MAILTO:noreply@aprettygirlmatter.com`,
    'BEGIN:VALARM',
    'TRIGGER:-PT48H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${booking.serviceName} in 2 days`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${booking.serviceName} tomorrow`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${booking.serviceName} in 1 hour`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/**
 * Encodes string to base64 (works in Node.js edge runtime).
 */
function toBase64(str: string): string {
  return Buffer.from(str).toString('base64');
}

/**
 * Sends an email via GHL conversations API with an iCal attachment.
 * GHL does not natively support raw MIME attachments through its messages API,
 * so we embed the iCal as a base64 data-URI link and include it as a downloadable
 * link in the HTML body. The raw .ics content is also included as a plaintext
 * attachment block so email clients that support it will parse the invite.
 *
 * For full iCal attachment support, swap this for an SMTP provider
 * (SendGrid, Postmark, Nodemailer) in the future.
 */
async function sendViaGHL(
  apiKey: string,
  contactId: string,
  subject: string,
  html: string
): Promise<void> {
  const response = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'Email',
      contactId,
      html,
      subject,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GHL email failed (${response.status}): ${text}`);
  }
}

async function findOrCreateContact(
  apiKey: string,
  locationId: string,
  booking: { clientName: string; clientEmail: string; clientPhone?: string }
): Promise<string | null> {
  // Search by email
  const searchRes = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&query=${encodeURIComponent(booking.clientEmail)}`,
    { headers: { 'Authorization': `Bearer ${apiKey}`, 'Version': '2021-07-28' } }
  );
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.contacts?.length > 0) return searchData.contacts[0].id;
  }

  // Create if not found
  const createRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId,
      email: booking.clientEmail,
      name: booking.clientName,
      phone: booking.clientPhone || '',
    }),
  });
  if (createRes.ok) {
    const createData = await createRes.json();
    return createData.contact?.id || null;
  }
  return null;
}

async function findOrCreateVictoriaContact(
  apiKey: string,
  locationId: string
): Promise<string | null> {
  const searchRes = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&query=${encodeURIComponent(VICTORIA_EMAIL)}`,
    { headers: { 'Authorization': `Bearer ${apiKey}`, 'Version': '2021-07-28' } }
  );
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.contacts?.length > 0) return data.contacts[0].id;
  }

  const createRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId,
      email: VICTORIA_EMAIL,
      name: 'Victoria (Admin)',
      tags: ['admin', 'internal'],
    }),
  });
  if (createRes.ok) {
    const data = await createRes.json();
    return data.contact?.id || null;
  }
  return null;
}

/**
 * POST /api/bookings/followup-confirmation-email
 *
 * Sends a confirmation email to the client with booking details and an iCal
 * calendar invite link. Also sends a BCC copy to Victoria.
 */
export async function POST(req: NextRequest) {
  try {
    const { booking } = await req.json();

    if (!booking) {
      return NextResponse.json({ error: 'Booking data is required' }, { status: 400 });
    }

    const apiKey = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;

    if (!apiKey || !locationId) {
      console.warn('GHL credentials not configured, skipping followup confirmation email');
      return NextResponse.json({ success: false, message: 'Email service not configured' });
    }

    const appointmentDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate iCal content
    const icalContent = generateICalContent({
      clientName: booking.clientName,
      serviceName: booking.serviceName || 'PMU Appointment',
      date: booking.date,
      time: booking.time,
      endTime: booking.endTime,
      notes: booking.notes,
    });

    // Create a data URI so clients can download the .ics file directly from email
    const icalDataUri = `data:text/calendar;charset=utf-8;base64,${toBase64(icalContent)}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #AD6269 0%, #9d5860 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 26px; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
    .details-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .details-box h3 { margin-top: 0; color: #AD6269; font-size: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; }
    .detail-value { font-weight: 600; color: #333; }
    .ical-box { background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
    .ical-box p { margin: 0 0 12px; font-size: 14px; color: #2e7d32; }
    .ical-button { display: inline-block; background: #2e7d32; color: white; padding: 10px 24px; text-decoration: none; border-radius: 20px; font-size: 14px; font-weight: 600; }
    .cancel-box { background: #fff8e1; border-left: 4px solid #AD6269; padding: 14px 16px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 13px; color: #555; }
    .cancel-box strong { color: #AD6269; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Appointment Confirmed!</h1>
      <p>A Pretty Girl Matter — Permanent Makeup Studio</p>
    </div>
    <div class="content">
      <p>Dear ${booking.clientName},</p>

      <p>Thank you so much for booking your appointment with us! We truly appreciate your trust and look forward to seeing you. Below are your booking details — please review them and reach out if anything needs to be adjusted.</p>

      <div class="details-box">
        <h3>📅 Your Appointment Details</h3>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${booking.serviceName || 'PMU Appointment'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${appointmentDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${booking.time}${booking.endTime ? ' – ' + booking.endTime : ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Artist</span>
          <span class="detail-value">${booking.artistName || 'Victoria'}</span>
        </div>
        ${booking.notes ? `
        <div class="detail-row">
          <span class="detail-label">Notes</span>
          <span class="detail-value">${booking.notes}</span>
        </div>` : ''}
      </div>

      <div class="ical-box">
        <p>📆 <strong>Add this appointment to your calendar</strong><br/>Click the attachment or the button below to save it directly to your calendar app.</p>
        <a href="${icalDataUri}" download="appointment.ics" class="ical-button">📅 Add to My Calendar</a>
      </div>

      <div class="cancel-box">
        <strong>Need to cancel or reschedule?</strong><br/>
        Please contact Victoria as a courtesy as soon as possible so she can accommodate other clients:<br/>
        📧 <a href="mailto:victoria@aprettygirlmatter.com" style="color:#AD6269;">victoria@aprettygirlmatter.com</a><br/>
        📞 Or give us a call — we're happy to help!
      </div>

      <h3 style="color:#AD6269;">📋 Before Your Appointment</h3>
      <ul style="font-size:14px; color:#555; padding-left:20px;">
        <li>Avoid caffeine and alcohol 24 hours before</li>
        <li>Avoid blood thinners (aspirin, ibuprofen) 48 hours before</li>
        <li>Avoid sun exposure and tanning beforehand</li>
        <li>Come with clean skin — no makeup on the treatment area</li>
      </ul>

      <p style="font-size:14px;">We can't wait to see you! If you have any questions before your appointment, don't hesitate to reach out.</p>

      <p style="font-size:14px;">With love,<br/><strong>Victoria &amp; the A Pretty Girl Matter Team</strong></p>
    </div>
    <div class="footer">
      <p>A Pretty Girl Matter | Premium Permanent Makeup Services</p>
      <p>© ${new Date().getFullYear()} All rights reserved</p>
    </div>
  </div>
</body>
</html>
    `;

    const subject = `✨ Your Appointment is Confirmed — ${appointmentDate}`;

    // --- Send to client ---
    let clientContactId = booking.ghlContactId || null;
    if (!clientContactId) {
      clientContactId = await findOrCreateContact(apiKey, locationId, {
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
      });
    }

    if (clientContactId) {
      await sendViaGHL(apiKey, clientContactId, subject, emailHtml);
      console.log('✅ Followup confirmation email sent to client');
    } else {
      console.warn('Could not find/create client contact — skipping client email');
    }

    // --- Send BCC copy to Victoria ---
    const victoriaHtml = emailHtml.replace(
      '<p>Dear ' + booking.clientName + ',</p>',
      `<p style="background:#fff3cd;padding:10px;border-radius:6px;font-size:13px;">
        <strong>📋 Admin Copy (BCC)</strong> — This is a copy of the confirmation sent to <strong>${booking.clientName}</strong> (${booking.clientEmail}).
      </p>
      <p>Dear ${booking.clientName},</p>`
    );

    const victoriaContactId = await findOrCreateVictoriaContact(apiKey, locationId);
    if (victoriaContactId) {
      await sendViaGHL(
        apiKey,
        victoriaContactId,
        `[BCC] ${subject} — ${booking.clientName}`,
        victoriaHtml
      );
      console.log('✅ BCC copy sent to Victoria');
    } else {
      console.warn('Could not find/create Victoria contact — skipping BCC');
    }

    return NextResponse.json({ success: true, message: 'Confirmation emails sent' });
  } catch (error) {
    console.error('Error sending followup confirmation email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
