import { NextRequest, NextResponse } from 'next/server';

const VICTORIA_EMAIL = process.env.ADMIN_EMAIL || 'victoria@aprettygirlmatter.com';
const GHL_BASE = 'https://services.leadconnectorhq.com';

/**
 * GHL Appointment Reminder Workflow
 *
 * Triggered after a booking is created via /mobile-followup.
 * Schedules a countdown reminder sequence for the client via alternating
 * SMS and Email messages through GHL conversations.
 *
 * Reminder sequence (relative to appointment start):
 *   T-48h  → Email  — "2 days to go" + cancel/reschedule contact info
 *   T-24h  → SMS   — "Tomorrow reminder" + cancel/reschedule contact info
 *   Day-of @ 08:00 → Email — "Today is the day!" + cancel/reschedule contact info
 *   T-1h   → SMS   — "1 hour away" + cancel/reschedule contact info
 *
 * GHL does not expose a native "scheduled message" REST endpoint for arbitrary
 * future timestamps, so we create GHL Tasks with due dates as reminder anchors
 * and use the GHL Workflow automation (configured inside GHL) to send the
 * actual messages. This route creates the GHL contact, tags it, and creates
 * tasks for each reminder interval.  A GHL Workflow (see notes below) picks
 * up on those task creation events to fire the SMS/email automations.
 *
 * If GHL_WORKFLOW_ID is set in env vars, we additionally enroll the contact
 * directly in the GHL workflow via the enrollment endpoint.
 *
 * POST /api/workflows/ghl-appointment-reminders
 * Body: { booking: BookingData }
 */

interface BookingData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName?: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  endTime?: string;
  artistName?: string;
  notes?: string;
  ghlContactId?: string;
  ghlAppointmentId?: string;
}

async function getGHLCredentials() {
  const apiKey = process.env.GHL_API_KEY || '';
  const locationId = process.env.GHL_LOCATION_ID || '';
  return { apiKey, locationId };
}

/**
 * Finds or creates a GHL contact.
 */
async function ensureContact(
  apiKey: string,
  locationId: string,
  booking: BookingData
): Promise<string | null> {
  if (booking.ghlContactId) return booking.ghlContactId;

  // Search
  const searchRes = await fetch(
    `${GHL_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(booking.clientEmail)}`,
    { headers: { Authorization: `Bearer ${apiKey}`, Version: '2021-07-28' } }
  );
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.contacts?.length > 0) return data.contacts[0].id;
  }

  // Create
  const createRes = await fetch(`${GHL_BASE}/contacts/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId,
      email: booking.clientEmail,
      name: booking.clientName,
      phone: booking.clientPhone || '',
      source: 'Mobile Followup Booking',
    }),
  });

  if (createRes.ok) {
    const data = await createRes.json();
    return data.contact?.id || null;
  }
  return null;
}

/**
 * Adds tags to a contact.
 */
async function tagContact(
  apiKey: string,
  contactId: string,
  tags: string[]
): Promise<void> {
  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tags }),
  });
}

/**
 * Creates a GHL Task for a contact. Tasks are used as workflow triggers
 * inside GHL automations for "Task Created" events.
 */
async function createTask(
  apiKey: string,
  contactId: string,
  title: string,
  dueDateISO: string,
  description: string
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      dueDate: dueDateISO,
      description,
      status: 'incompleted',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`Task creation warning (${res.status}):`, text);
  }
}

/**
 * Sends an immediate message via GHL conversations API.
 * type: 'SMS' | 'Email'
 */
async function sendMessage(
  apiKey: string,
  contactId: string,
  type: 'SMS' | 'Email',
  subject: string,
  body: string
): Promise<void> {
  const payload: Record<string, unknown> = { type, contactId };

  if (type === 'Email') {
    payload.subject = subject;
    payload.html = body;
  } else {
    payload.message = body;
  }

  const res = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`Message send warning (${res.status}):`, text);
  }
}

/**
 * Enrolls contact in a GHL Workflow by workflow ID.
 */
async function enrollInWorkflow(
  apiKey: string,
  contactId: string,
  workflowId: string,
  locationId: string
): Promise<void> {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/workflow/${workflowId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ eventStartTime: new Date().toISOString() }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`GHL workflow enrollment warning (${res.status}):`, text);
  }
}

/**
 * Builds the HTML email body for a reminder.
 */
function buildReminderEmail(
  clientName: string,
  serviceName: string,
  appointmentDate: string,
  appointmentTime: string,
  headline: string,
  subtext: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
    .container{max-width:600px;margin:0 auto;padding:20px}
    .header{background:linear-gradient(135deg,#AD6269 0%,#9d5860 100%);color:white;padding:28px;text-align:center;border-radius:10px 10px 0 0}
    .header h1{margin:0;font-size:24px}
    .content{background:#fff;padding:28px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 10px 10px}
    .details-box{background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0}
    .detail-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e0e0e0;font-size:14px}
    .detail-row:last-child{border-bottom:none}
    .cancel-box{background:#fff8e1;border-left:4px solid #AD6269;padding:12px 14px;margin:16px 0;border-radius:0 8px 8px 0;font-size:13px;color:#555}
    .footer{text-align:center;padding:16px;color:#999;font-size:12px}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${headline}</h1>
      <p style="margin:6px 0 0;opacity:.9;font-size:14px">A Pretty Girl Matter</p>
    </div>
    <div class="content">
      <p>Hi ${clientName},</p>
      <p>${subtext}</p>
      <div class="details-box">
        <div class="detail-row"><span style="color:#666">Service</span><strong>${serviceName}</strong></div>
        <div class="detail-row"><span style="color:#666">Date</span><strong>${appointmentDate}</strong></div>
        <div class="detail-row"><span style="color:#666">Time</span><strong>${appointmentTime}</strong></div>
      </div>
      <div class="cancel-box">
        <strong>Need to cancel or reschedule?</strong><br/>
        Please contact Victoria as a courtesy as soon as possible:<br/>
        📧 <a href="mailto:victoria@aprettygirlmatter.com" style="color:#AD6269">victoria@aprettygirlmatter.com</a><br/>
        📞 Or give us a call — we're happy to help!
      </div>
      <p style="font-size:14px">We look forward to seeing you!<br/><strong>Victoria &amp; the A Pretty Girl Matter Team</strong></p>
    </div>
    <div class="footer">
      <p>A Pretty Girl Matter | Premium Permanent Makeup Services</p>
      <p>© ${new Date().getFullYear()} All rights reserved</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Builds an SMS reminder body.
 */
function buildReminderSMS(
  clientName: string,
  serviceName: string,
  appointmentDate: string,
  appointmentTime: string,
  headline: string
): string {
  return (
    `Hi ${clientName}! ${headline}\n\n` +
    `📅 ${serviceName}\n` +
    `🗓 ${appointmentDate} at ${appointmentTime}\n\n` +
    `Need to cancel or reschedule? Please contact Victoria as a courtesy:\n` +
    `📧 victoria@aprettygirlmatter.com\n` +
    `We look forward to seeing you! — A Pretty Girl Matter`
  );
}

export async function POST(req: NextRequest) {
  try {
    const { booking }: { booking: BookingData } = await req.json();

    if (!booking?.date || !booking?.time) {
      return NextResponse.json({ error: 'Booking date and time are required' }, { status: 400 });
    }

    const { apiKey, locationId } = await getGHLCredentials();
    if (!apiKey || !locationId) {
      console.warn('GHL credentials not configured — skipping reminder workflow');
      return NextResponse.json({ success: false, message: 'GHL not configured' });
    }

    const contactId = await ensureContact(apiKey, locationId, booking);
    if (!contactId) {
      console.warn('Could not find/create GHL contact for reminder workflow');
      return NextResponse.json({ success: false, message: 'Contact not found' });
    }

    // Tag the contact so GHL workflows can filter on it
    await tagContact(apiKey, contactId, [
      'appointment-scheduled',
      (booking.serviceName || 'pmu-appointment').toLowerCase().replace(/\s+/g, '-'),
    ]);

    const apptStart = new Date(`${booking.date}T${booking.time}:00`);

    const appointmentDateStr = apptStart.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const appointmentTimeStr = booking.time + (booking.endTime ? ` – ${booking.endTime}` : '');
    const serviceName = booking.serviceName || 'PMU Appointment';

    // ---------------------------------------------------------------------------
    // Create GHL Tasks as workflow trigger anchors
    // GHL automations listen for "Task Created" and fire scheduled actions.
    // Each task title matches the trigger name used in the GHL Workflow (see docs).
    // ---------------------------------------------------------------------------

    const minus48h = new Date(apptStart.getTime() - 48 * 60 * 60 * 1000);
    const minus24h = new Date(apptStart.getTime() - 24 * 60 * 60 * 1000);
    const dayOfAt8 = new Date(`${booking.date}T08:00:00`);
    const minus1h  = new Date(apptStart.getTime() - 60 * 60 * 1000);

    await Promise.allSettled([
      createTask(apiKey, contactId, 'APGM-REMINDER-48H-EMAIL', minus48h.toISOString(),
        `Send 2-day email reminder for ${serviceName} on ${appointmentDateStr}`),
      createTask(apiKey, contactId, 'APGM-REMINDER-24H-SMS', minus24h.toISOString(),
        `Send 1-day SMS reminder for ${serviceName} on ${appointmentDateStr}`),
      createTask(apiKey, contactId, 'APGM-REMINDER-DAOY-EMAIL', dayOfAt8.toISOString(),
        `Send day-of email reminder for ${serviceName} at ${appointmentTimeStr}`),
      createTask(apiKey, contactId, 'APGM-REMINDER-1H-SMS', minus1h.toISOString(),
        `Send 1-hour SMS reminder for ${serviceName} at ${appointmentTimeStr}`),
    ]);

    // ---------------------------------------------------------------------------
    // If GHL_REMINDER_WORKFLOW_ID is configured, enroll the contact directly.
    // This is the preferred path once the workflow is created in GHL.
    // ---------------------------------------------------------------------------
    const workflowId = process.env.GHL_REMINDER_WORKFLOW_ID;
    if (workflowId) {
      await enrollInWorkflow(apiKey, contactId, workflowId, locationId);
      console.log(`✅ Contact enrolled in GHL reminder workflow: ${workflowId}`);
    } else {
      // ---------------------------------------------------------------------------
      // Fallback: send reminders immediately as a demonstration / for testing.
      // In production, remove this block and rely on the GHL workflow.
      // ---------------------------------------------------------------------------
      console.log('GHL_REMINDER_WORKFLOW_ID not set — sending demonstration reminders immediately');

      // 48h — Email
      await sendMessage(
        apiKey, contactId, 'Email',
        `⏰ 2 Days Until Your Appointment — ${serviceName}`,
        buildReminderEmail(booking.clientName, serviceName, appointmentDateStr, appointmentTimeStr,
          '⏰ 2 Days to Go!',
          `Just a friendly reminder that your appointment is coming up in <strong>2 days</strong>! We're excited to see you.`)
      );

      // 24h — SMS
      await sendMessage(
        apiKey, contactId, 'SMS',
        '',
        buildReminderSMS(booking.clientName, serviceName, appointmentDateStr, appointmentTimeStr,
          '⏰ Your appointment is TOMORROW!')
      );

      // Day-of 8am — Email
      await sendMessage(
        apiKey, contactId, 'Email',
        `🌟 Today is Your Appointment Day! — ${serviceName}`,
        buildReminderEmail(booking.clientName, serviceName, appointmentDateStr, appointmentTimeStr,
          '🌟 Today is the Day!',
          `Good morning! Your appointment is <strong>today</strong>. We can't wait to see you!`)
      );

      // 1h — SMS
      await sendMessage(
        apiKey, contactId, 'SMS',
        '',
        buildReminderSMS(booking.clientName, serviceName, appointmentDateStr, appointmentTimeStr,
          '🔔 Your appointment is in 1 HOUR!')
      );
    }

    console.log('✅ GHL appointment reminder workflow initiated for', booking.clientName);

    return NextResponse.json({
      success: true,
      contactId,
      workflowEnrolled: !!workflowId,
      message: workflowId
        ? 'Contact enrolled in GHL reminder workflow'
        : 'Reminder tasks created and demo messages sent (set GHL_REMINDER_WORKFLOW_ID for production)',
    });
  } catch (error) {
    console.error('Error initiating GHL reminder workflow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate workflow' },
      { status: 500 }
    );
  }
}

/**
 * =============================================================================
 * GHL WORKFLOW SETUP GUIDE
 * =============================================================================
 *
 * Create a workflow in GHL named "APGM Appointment Reminder Sequence" with the
 * following structure.  Once created, copy its Workflow ID and set it as:
 *   GHL_REMINDER_WORKFLOW_ID=<your-workflow-id>
 *
 * TRIGGER
 * -------
 * Trigger Type: "Contact Created" OR "Tag Added" (tag = "appointment-scheduled")
 *
 * WORKFLOW STEPS (in order)
 * -------------------------
 *
 * 1. WAIT until 2 days before appointment date
 *    Action: Wait → Custom date/time → {{contact.appointment_date}} - 2 days
 *
 * 2. SEND EMAIL — "2 Days to Go!"
 *    Subject: ⏰ 2 Days Until Your {{appointment.service}} Appointment
 *    Body:
 *      Hi {{contact.first_name}},
 *
 *      Just a friendly reminder — your {{appointment.service}} appointment
 *      is coming up in 2 days!
 *
 *      📅 Date: {{appointment.date}}
 *      🕐 Time: {{appointment.time}}
 *
 *      Need to cancel or reschedule? Please contact Victoria as a courtesy ASAP:
 *      📧 victoria@aprettygirlmatter.com | 📞 [phone number]
 *
 *      We look forward to seeing you!
 *      — A Pretty Girl Matter
 *
 * 3. WAIT 24 hours
 *    Action: Wait → Duration → 24 hours
 *
 * 4. SEND SMS — "Tomorrow Reminder"
 *    Message:
 *      Hi {{contact.first_name}}! ⏰ Your {{appointment.service}} is TOMORROW
 *      at {{appointment.time}}.
 *
 *      Need to cancel or reschedule? Contact Victoria ASAP:
 *      📧 victoria@aprettygirlmatter.com
 *      — A Pretty Girl Matter
 *
 * 5. WAIT until 8:00 AM on appointment day
 *    Action: Wait → Custom date/time → {{contact.appointment_date}} at 08:00 AM
 *
 * 6. SEND EMAIL — "Today is the Day!"
 *    Subject: 🌟 Today is Your {{appointment.service}} Day!
 *    Body:
 *      Good morning {{contact.first_name}}!
 *
 *      Your appointment is TODAY at {{appointment.time}}. We're so excited to
 *      see you!
 *
 *      📅 Date: {{appointment.date}}
 *      🕐 Time: {{appointment.time}}
 *
 *      Need to cancel or reschedule? Please contact Victoria as a courtesy:
 *      📧 victoria@aprettygirlmatter.com | 📞 [phone number]
 *
 *      See you soon!
 *      — A Pretty Girl Matter
 *
 * 7. WAIT until 1 hour before appointment
 *    Action: Wait → Custom date/time → {{contact.appointment_start_time}} - 1 hour
 *
 * 8. SEND SMS — "1 Hour Away"
 *    Message:
 *      Hi {{contact.first_name}}! 🔔 Your {{appointment.service}} appointment
 *      is in 1 HOUR at {{appointment.time}}.
 *
 *      Need to cancel/reschedule? Contact Victoria ASAP:
 *      📧 victoria@aprettygirlmatter.com
 *      — A Pretty Girl Matter
 *
 * NOTES
 * -----
 * - Set toNotify: true when creating the GHL appointment so GHL fires its
 *   built-in confirmation email automatically in addition to this sequence.
 * - If appointment date is less than 48h away, GHL will skip steps with
 *   elapsed wait times and proceed to the next applicable step.
 * - The GHL_REMINDER_WORKFLOW_ID env var must be set to the Workflow ID
 *   found in GHL → Automation → Workflows → (select workflow) → URL.
 * =============================================================================
 */
