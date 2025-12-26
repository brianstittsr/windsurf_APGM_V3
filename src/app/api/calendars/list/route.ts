import { NextRequest, NextResponse } from 'next/server';

// No Firebase Admin dependency to avoid Turbopack symlink issues on Windows

export async function GET(request: NextRequest) {
  try {
    // Get GHL credentials from environment variables
    const apiKey = process.env.GHL_API_KEY || '';
    const locationId = process.env.GHL_LOCATION_ID || '';
    
    if (!apiKey || !locationId) {
      // Return empty calendars if not configured (graceful degradation)
      return NextResponse.json({
        success: true,
        calendars: [],
        message: 'GHL credentials not configured'
      });
    }

    // Fetch calendars from GHL
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch calendars:', response.status, errorText);
      // Return empty calendars on error (graceful degradation)
      return NextResponse.json({
        success: true,
        calendars: [],
        error: 'Failed to fetch calendars from GHL'
      });
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
    // Return empty calendars on error (graceful degradation)
    return NextResponse.json({
      success: true,
      calendars: [],
      error: error instanceof Error ? error.message : 'Failed to fetch calendars'
    });
  }
}
