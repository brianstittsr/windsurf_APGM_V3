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

    // Test the GoHighLevel API connection using Private Integration endpoint
    // Private Integrations use the services.leadconnectorhq.com domain
    const response = await fetch('https://services.leadconnectorhq.com/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        user: {
          id: data.id,
          name: data.name || data.firstName + ' ' + data.lastName,
          email: data.email,
          companyId: data.companyId
        }
      });
    } else {
      const errorText = await response.text();
      console.error('GHL API Error:', response.status, errorText);
      
      // Try to parse error response
      let errorMessage = 'Invalid API Key or connection failed';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Use default error message
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
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
