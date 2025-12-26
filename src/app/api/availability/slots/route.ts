import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

// Default time slots
const DEFAULT_SLOTS = {
  morning: { startTime: '10:00', label: 'Morning' },
  afternoon: { startTime: '13:00', label: 'Afternoon' },
  evening: { startTime: '16:00', label: 'Evening' },
};

/**
 * GET /api/availability/slots
 * 
 * Fetch slot availability for a specific date
 * Query params: date (YYYY-MM-DD format)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'date parameter is required' },
        { status: 400 }
      );
    }

    // Get custom time settings if available
    let customTimes = { ...DEFAULT_SLOTS };
    try {
      const settingsDoc = await db.collection('bookingSettings').doc('timeSlots').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        if (data?.morning?.startTime) customTimes.morning.startTime = data.morning.startTime;
        if (data?.afternoon?.startTime) customTimes.afternoon.startTime = data.afternoon.startTime;
        if (data?.evening?.startTime) customTimes.evening.startTime = data.evening.startTime;
      }
    } catch (error) {
      console.log('Using default time slots');
    }

    // Check which slots are booked
    const bookedSlots: string[] = [];

    // Check GHL appointments
    const { apiKey, locationId } = await getGHLCredentials();
    if (apiKey && locationId) {
      try {
        const appointments = await fetchGHLAppointmentsForDate(apiKey, locationId, date);
        
        for (const apt of appointments) {
          const aptTime = new Date(apt.startTime);
          const hour = aptTime.getHours();
          
          // Determine which slot this appointment falls into
          if (hour >= 9 && hour < 12) {
            bookedSlots.push('morning');
          } else if (hour >= 12 && hour < 15) {
            bookedSlots.push('afternoon');
          } else if (hour >= 15 && hour < 19) {
            bookedSlots.push('evening');
          }
        }
      } catch (error) {
        console.error('Error fetching GHL appointments:', error);
      }
    }

    // Also check local bookings
    try {
      const bookingsSnapshot = await db.collection('bookings')
        .where('appointmentDate', '==', date)
        .get();

      for (const doc of bookingsSnapshot.docs) {
        const data = doc.data();
        const slotId = data.slotId || data.timeSlot;
        
        if (slotId && !bookedSlots.includes(slotId)) {
          bookedSlots.push(slotId);
        } else if (data.appointmentTime) {
          // Parse time to determine slot
          const [hours] = data.appointmentTime.split(':').map(Number);
          if (hours >= 9 && hours < 12 && !bookedSlots.includes('morning')) {
            bookedSlots.push('morning');
          } else if (hours >= 12 && hours < 15 && !bookedSlots.includes('afternoon')) {
            bookedSlots.push('afternoon');
          } else if (hours >= 15 && hours < 19 && !bookedSlots.includes('evening')) {
            bookedSlots.push('evening');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching local bookings:', error);
    }

    return NextResponse.json({
      date,
      customTimes,
      bookedSlots: [...new Set(bookedSlots)], // Remove duplicates
    });

  } catch (error) {
    console.error('Error fetching slot availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slot availability' },
      { status: 500 }
    );
  }
}

async function getGHLCredentials() {
  try {
    const settingsSnapshot = await db.collection('crmSettings').limit(1).get();
    if (!settingsSnapshot.empty) {
      const data = settingsSnapshot.docs[0].data();
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || '',
      };
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || '',
  };
}

async function fetchGHLAppointmentsForDate(
  apiKey: string,
  locationId: string,
  date: string
): Promise<any[]> {
  const startTime = new Date(date + 'T00:00:00').toISOString();
  const endTime = new Date(date + 'T23:59:59').toISOString();

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
