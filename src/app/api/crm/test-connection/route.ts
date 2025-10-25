import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 400 }
      );
    }

    // Test the GoHighLevel API connection
    const response = await fetch('https://rest.gohighlevel.com/v1/locations/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        locations: data.locations || []
      });
    } else {
      const errorText = await response.text();
      console.error('GHL API Error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid API Key or connection failed',
          details: errorText
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error testing GHL connection:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
