import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/search-ghl-appointments
 * 
 * Search GHL appointments by contact ID or get all appointments
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId') || '';
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    
    const apiKey = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;
    
    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'GHL credentials not configured' }, { status: 500 });
    }
    
    // Get all calendars first
    const calendarsResponse = await fetch(
      `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );
    
    if (!calendarsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 });
    }
    
    const calendarsData = await calendarsResponse.json();
    const calendars = calendarsData.calendars || [];
    
    // Fetch appointments from each calendar
    const allAppointments: any[] = [];
    
    for (const calendar of calendars) {
      try {
        let url = `https://services.leadconnectorhq.com/calendars/events?calendarId=${calendar.id}&locationId=${locationId}&startTime=${encodeURIComponent(startDate)}&endTime=${encodeURIComponent(endDate)}`;
        
        if (contactId) {
          url += `&contactId=${contactId}`;
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const events = data.events || [];
          events.forEach((event: any) => {
            allAppointments.push({
              ...event,
              calendarName: calendar.name,
              calendarId: calendar.id
            });
          });
        }
      } catch (e) {
        console.error(`Error fetching appointments from calendar ${calendar.id}:`, e);
      }
    }
    
    // Sort by start time descending
    allAppointments.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    return NextResponse.json({
      count: allAppointments.length,
      appointments: allAppointments,
      calendars: calendars.map((c: any) => ({ id: c.id, name: c.name }))
    });
    
  } catch (error) {
    console.error('[Admin] Error searching GHL appointments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search appointments' },
      { status: 500 }
    );
  }
}
