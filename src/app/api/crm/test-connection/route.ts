import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    console.log('🔑 Testing GHL API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NO KEY PROVIDED');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 400 }
      );
    }

    // Test the GoHighLevel API connection using Private Integration endpoint
    // Private Integrations use the services.leadconnectorhq.com domain
    // NOTE: Private Integrations don't have /locations/ endpoint
    // Use /contacts/ instead which is available to all Private Integrations
    const apiUrl = 'https://services.leadconnectorhq.com/contacts/?limit=1';
    console.log('📡 Calling GHL API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 GHL API Response Status:', response.status);
    
    // Clone the response before reading it to avoid the "Body is unusable" error
    // We'll read the original response for logging and use the clone for processing
    const responseClone = response.clone();
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GHL API Error Response:', errorText);
      
      // Use the cloned response for error handling
      let errorMessage = 'Invalid API Key or connection failed';
      let scopeError = false;
      
      try {
        // Parse the error text
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
✅ contacts.readonly, contacts.write (REQUIRED FOR TESTING)
✅ conversations.readonly, conversations.write  
✅ forms.readonly
✅ invoices.readonly, invoices.write
✅ opportunities.readonly, opportunities.write
✅ surveys.readonly
✅ workflows.readonly

After enabling scopes, regenerate your API key and try again.`;
        }
      } catch (e) {
        // Use default error message
        console.error('Error parsing error response:', e);
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          scopeError,
          details: errorText,
          status: response.status
        },
        { status: 401 }
      );
    }

    // For successful responses
    try {
      const data = await responseClone.json();
      const contacts = data.contacts || [];
      return NextResponse.json({
        success: true,
        message: 'Connection successful! Your Private Integration API key is working.',
        contactCount: contacts.length,
        testEndpoint: '/contacts/',
        note: 'Private Integration API keys work within a single location. Use your Location ID for location-specific operations.'
      });
    } catch (jsonError) {
      console.error('Error parsing success response:', jsonError);
      // In case of JSON parsing error, return the raw text
      const rawText = await response.clone().text();
      return NextResponse.json({
        success: true,
        message: 'Connection successful, but could not parse response',
        raw: rawText
      });
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
