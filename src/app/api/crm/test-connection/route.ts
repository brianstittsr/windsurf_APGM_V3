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
    // Try a simpler endpoint that requires fewer scopes - locations
    const response = await fetch('https://services.leadconnectorhq.com/locations/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GHL API Response Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      const locations = data.locations || [];
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        locationCount: locations.length,
        locations: locations.slice(0, 3).map((loc: any) => ({
          id: loc.id,
          name: loc.name
        }))
      });
    } else {
      const errorText = await response.text();
      console.error('GHL API Error:', response.status, errorText);
      
      // Try to parse error response
      let errorMessage = 'Invalid API Key or connection failed';
      let scopeError = false;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Check if it's a scope error
        if (errorMessage.includes('scope') || errorMessage.includes('authorized')) {
          scopeError = true;
          errorMessage = `API Key missing required scopes. Please enable these scopes in GoHighLevel Settings → Integrations → Private Integrations:

REQUIRED SCOPES FOR BMAD ORCHESTRATOR:
✅ businesses.readonly
✅ calendars.readonly, calendars.write
✅ campaigns.readonly
✅ contacts.readonly, contacts.write
✅ conversations.readonly, conversations.write  
✅ forms.readonly
✅ invoices.readonly, invoices.write
✅ locations.readonly
✅ opportunities.readonly, opportunities.write
✅ surveys.readonly
✅ workflows.readonly

After enabling scopes, regenerate your API key and try again.`;
        }
      } catch (e) {
        // Use default error message
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          scopeError,
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
