import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = body.apiKey;
    const locationId = body.locationId || 'kfGFMn1aPE1AhW18tpG8'; // Default location ID

    const diagnostics = {
      keyProvided: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyFirstChars: apiKey?.substring(0, 10) || '',
      keyLastChars: apiKey?.substring(apiKey?.length - 10) || '',
      hasSpaces: apiKey?.includes(' ') || false,
      hasNewlines: apiKey?.includes('\n') || apiKey?.includes('\r') || false,
      trimmedLength: apiKey?.trim().length || 0,
      locationId: locationId
    };

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'No API key provided',
        diagnostics
      }, { status: 400 });
    }

    // Clean the API key
    const cleanKey = apiKey.trim();

    // Test with GoHighLevel API
    // Private Integrations require Location ID in query parameters
    const apiUrl = `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&limit=1`;
    
    console.log('📡 Testing GHL API with cleaned key...');
    console.log('🔑 Key length:', cleanKey.length);
    console.log('🔑 First 15 chars:', cleanKey.substring(0, 15));
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      }
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📊 Response Body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      // Detailed error analysis
      const errorAnalysis = {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseData,
        possibleIssues: [] as string[]
      };

      if (response.status === 401) {
        errorAnalysis.possibleIssues.push('API key is invalid or expired');
        errorAnalysis.possibleIssues.push('API key may not have been regenerated after enabling scopes');
        errorAnalysis.possibleIssues.push('Check that you copied the ENTIRE key without spaces');
      }

      if (response.status === 403) {
        errorAnalysis.possibleIssues.push('API key is missing required scopes');
        errorAnalysis.possibleIssues.push('Ensure "contacts.readonly" scope is enabled');
        errorAnalysis.possibleIssues.push('Regenerate API key after enabling scopes');
      }

      if (response.status === 404) {
        errorAnalysis.possibleIssues.push('Endpoint not found - verify API URL');
        errorAnalysis.possibleIssues.push('May be using wrong API type (Agency vs Private Integration)');
      }

      return NextResponse.json({
        success: false,
        error: 'API Key validation failed',
        diagnostics,
        errorAnalysis,
        recommendations: [
          '1. Go to GoHighLevel → Settings → Integrations → Private Integrations',
          '2. Verify ALL scopes are enabled (especially contacts.readonly)',
          '3. Click "Regenerate API Key"',
          '4. Copy the ENTIRE new key (no spaces, no line breaks)',
          '5. Paste it carefully in the admin dashboard',
          '6. Try the test connection again'
        ]
      }, { status: response.status });
    }

    // Success
    return NextResponse.json({
      success: true,
      message: '✅ API Key is valid and working!',
      diagnostics,
      contactCount: responseData.contacts?.length || 0,
      testEndpoint: '/contacts/',
      note: 'Private Integration API keys work! Use location-specific endpoints with your Location ID.'
    });

  } catch (error) {
    console.error('❌ Diagnostic Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Diagnostic test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
