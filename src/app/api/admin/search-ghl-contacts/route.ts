import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/search-ghl-contacts
 * 
 * Search GHL contacts by name or email
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    
    const apiKey = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;
    
    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'GHL credentials not configured' }, { status: 500 });
    }
    
    // Search contacts in GHL
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28'
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `GHL API error: ${response.status}`, details: error }, { status: 500 });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      count: data.contacts?.length || 0,
      contacts: data.contacts || []
    });
    
  } catch (error) {
    console.error('[Admin] Error searching GHL contacts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search contacts' },
      { status: 500 }
    );
  }
}
