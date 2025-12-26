import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with error handling
let db: Firestore | null = null;
let adminInitError: string | null = null;

try {
  if (!getApps().length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!projectId || !clientEmail || !privateKey) {
      adminInitError = 'Firebase Admin credentials not configured';
      console.warn('⚠️ Firebase Admin: Missing credentials for month availability API');
    } else {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    }
  }
  if (!adminInitError) {
    db = getFirestore();
  }
} catch (error: any) {
  adminInitError = error.message;
  console.error('Firebase Admin initialization error:', error);
}

/**
 * GET /api/availability/month
 * 
 * Fetch booking counts for each day in a date range
 * Query params: startDate, endDate (YYYY-MM-DD format)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }

    // Get GHL credentials
    const { apiKey, locationId } = await getGHLCredentials();

    const availability: Record<string, { date: string; bookingCount: number; isAvailable: boolean }> = {};
    let nextAvailable: string | null = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate all dates in range
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      availability[dateString] = {
        date: dateString,
        bookingCount: 0,
        isAvailable: d >= today,
      };
    }

    // Try to fetch from GHL if credentials are available
    if (apiKey && locationId) {
      try {
        const appointments = await fetchGHLAppointments(apiKey, locationId, startDate, endDate);
        
        // Count bookings per day
        for (const apt of appointments) {
          const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
          if (availability[aptDate]) {
            availability[aptDate].bookingCount++;
            // Mark as unavailable if 2 or more bookings
            if (availability[aptDate].bookingCount >= 2) {
              availability[aptDate].isAvailable = false;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching GHL appointments:', error);
      }
    }

    // Also check local bookings collection
    if (db) {
      try {
        const bookingsSnapshot = await db.collection('bookings')
          .where('appointmentDate', '>=', startDate)
          .where('appointmentDate', '<=', endDate)
          .get();

      for (const doc of bookingsSnapshot.docs) {
          const data = doc.data();
          const aptDate = data.appointmentDate || data.date;
          if (aptDate && availability[aptDate]) {
            availability[aptDate].bookingCount++;
            if (availability[aptDate].bookingCount >= 2) {
              availability[aptDate].isAvailable = false;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching local bookings:', error);
      }
    }

    // Find next available date
    const sortedDates = Object.keys(availability).sort();
    for (const dateStr of sortedDates) {
      const dateObj = new Date(dateStr + 'T00:00:00');
      if (dateObj >= today && availability[dateStr].isAvailable) {
        nextAvailable = dateStr;
        break;
      }
    }

    return NextResponse.json({
      availability,
      nextAvailable,
      startDate,
      endDate,
    });

  } catch (error) {
    console.error('Error fetching month availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

async function getGHLCredentials() {
  try {
    if (db) {
      const settingsSnapshot = await db.collection('crmSettings').limit(1).get();
      if (!settingsSnapshot.empty) {
        const data = settingsSnapshot.docs[0].data();
        return {
          apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
          locationId: data?.locationId || process.env.GHL_LOCATION_ID || '',
        };
      }
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || '',
  };
}

async function fetchGHLAppointments(
  apiKey: string,
  locationId: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const startTime = new Date(startDate + 'T00:00:00').toISOString();
  const endTime = new Date(endDate + 'T23:59:59').toISOString();

  const response = await fetch(
    `https://services.leadconnectorhq.com/calendars/events?locationId=${locationId}&startTime=${startTime}&endTime=${endTime}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch GHL appointments: ${response.status}`);
  }

  const data = await response.json();
  return data.events || [];
}
