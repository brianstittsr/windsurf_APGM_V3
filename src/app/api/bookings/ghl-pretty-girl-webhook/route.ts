import { NextRequest, NextResponse } from 'next/server';

// GHL inbound webhook for "The Pretty Girl Preview - Virtual Consultation" workflow.
// Override with GHL_PRETTY_GIRL_WEBHOOK_URL env var if the workflow URL changes.
const DEFAULT_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/Wyy3BzaCa7rC36CsrH9z/webhook-trigger/cd9706ec-fd62-4bff-b358-0a3d24e082a0';

/**
 * POST /api/bookings/ghl-pretty-girl-webhook
 *
 * Forwards booking details for "The Pretty Girl Preview - Virtual Consultation"
 * to the GHL workflow inbound webhook. Called from the admin BookingWizard
 * after the booking is created. Kept server-side to avoid CORS issues and to
 * keep the webhook URL out of the browser bundle.
 */
export async function POST(request: NextRequest) {
  try {
    const { booking, result } = await request.json();

    if (!booking) {
      return NextResponse.json({ error: 'Missing booking data' }, { status: 400 });
    }

    const webhookUrl = process.env.GHL_PRETTY_GIRL_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

    // Derive first/last name from the full name if either piece is missing.
    const fullName = (booking.name || `${booking.firstName || ''} ${booking.lastName || ''}`.trim()).trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = (booking.firstName || nameParts[0] || '').trim();
    const lastName = (booking.lastName || nameParts.slice(1).join(' ') || '').trim();

    const payload = {
      event: 'booking_created',
      serviceName: booking.serviceName || '',
      serviceKey: 'pretty_girl_preview_virtual_consultation',
      name: fullName,
      FullName: fullName,
      firstName,
      lastName,
      // GHL workflow mappings sometimes expect capitalized or snake-cased keys.
      FirstName: firstName,
      LastName: lastName,
      first_name: firstName,
      last_name: lastName,
      email: booking.email || '',
      phone: booking.phone || '',
      appointmentDate: booking.appointmentDate || '',
      appointmentTime: booking.appointmentTime || '',
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      price: booking.price ?? 0,
      depositPaid: booking.depositPaid ?? false,
      depositMethod: booking.depositMethod || '',
      depositAmount: booking.depositAmount ?? 0,
      notes: booking.notes || '',
      ghlContactId: booking.contactId || result?.contactId || null,
      ghlAppointmentId: result?.appointmentId || null,
      source: 'admin_booking_wizard',
      createdAt: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[GHL Pretty Girl Webhook] Failed:', response.status, text);
      return NextResponse.json(
        { error: `GHL webhook returned ${response.status}`, details: text },
        { status: 502 }
      );
    }

    console.log(`[GHL Pretty Girl Webhook] Sent booking for ${payload.email} (${payload.appointmentDate} ${payload.appointmentTime})`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[GHL Pretty Girl Webhook] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send webhook' },
      { status: 500 }
    );
  }
}
