import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { bookingId, bookingData } = await request.json();

    if (!bookingData.artistId) {
      return NextResponse.json(
        { error: 'Artist ID required' },
        { status: 400 }
      );
    }

    // Get artist's Google Calendar tokens
    const tokenRef = doc(getDb(), 'googleCalendarTokens', bookingData.artistId);
    const tokenSnap = await getDoc(tokenRef);

    if (!tokenSnap.exists()) {
      return NextResponse.json(
        { error: 'Google Calendar not connected for this artist' },
        { status: 400 }
      );
    }

    const tokens = tokenSnap.data();

    // Get Google OAuth credentials from Firestore
    const configRef = doc(getDb(), 'integrationSettings', 'googleCalendar');
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      return NextResponse.json(
        { error: 'Google Calendar not configured' },
        { status: 400 }
      );
    }

    const config = configSnap.data();

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create calendar event
    const startDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour default

    const event = {
      summary: `${bookingData.serviceName} - ${bookingData.clientName}`,
      description: `Service: ${bookingData.serviceName}\nClient: ${bookingData.clientName}\nPhone: ${bookingData.clientPhone}\nEmail: ${bookingData.clientEmail}\nPrice: $${bookingData.price}\nDeposit Paid: ${bookingData.depositPaid ? 'Yes' : 'No'}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: [
        { email: bookingData.clientEmail }
      ],
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink
    });
  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const artistId = searchParams.get('artistId');

    if (!eventId || !artistId) {
      return NextResponse.json(
        { error: 'Event ID and Artist ID required' },
        { status: 400 }
      );
    }

    // Get artist's Google Calendar tokens
    const tokenRef = doc(getDb(), 'googleCalendarTokens', artistId);
    const tokenSnap = await getDoc(tokenRef);

    if (!tokenSnap.exists()) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    const tokens = tokenSnap.data();

    // Get Google OAuth credentials
    const configRef = doc(getDb(), 'integrationSettings', 'googleCalendar');
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      return NextResponse.json(
        { error: 'Google Calendar not configured' },
        { status: 400 }
      );
    }

    const config = configSnap.data();

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    return NextResponse.json({
      success: true,
      message: 'Event deleted from Google Calendar'
    });
  } catch (error) {
    console.error('Google Calendar delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete from Google Calendar' },
      { status: 500 }
    );
  }
}
