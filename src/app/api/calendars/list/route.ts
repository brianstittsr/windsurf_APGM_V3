import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get GHL credentials from Firestore
    const credentials = await getGHLCredentials();
    
    if (!credentials.apiKey || !credentials.locationId) {
      return NextResponse.json(
        { error: 'GHL credentials not configured' },
        { status: 400 }
      );
    }

    // Fetch calendars from GHL
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/?locationId=${credentials.locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch calendars:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch calendars from GHL' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const calendars = data.calendars || [];

    return NextResponse.json({
      success: true,
      calendars: calendars.map((cal: any) => ({
        id: cal.id,
        name: cal.name
      }))
    });

  } catch (error) {
    console.error('Error fetching calendars:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch calendars' },
      { status: 500 }
    );
  }
}

async function getGHLCredentials() {
  try {
    // First try to get from the collection (any document)
    const settingsSnapshot = await db.collection('crmSettings').limit(1).get();
    if (!settingsSnapshot.empty) {
      const data = settingsSnapshot.docs[0].data();
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
      };
    }
    
    // Fallback: try specific document ID for backwards compatibility
    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
      };
    }
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }
  
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || ''
  };
}
