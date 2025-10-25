import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

/**
 * Diagnostic endpoint to check GHL configuration
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Running GHL diagnostics...');

    // Check if settings exist
    const settingsList = await DatabaseService.getAll('crmSettings');
    const settings = settingsList.length > 0 ? settingsList[0] : null;

    const diagnostics = {
      timestamp: new Date().toISOString(),
      settingsFound: !!settings,
      apiKeyConfigured: !!(settings && (settings as any).apiKey),
      apiKeyLength: settings && (settings as any).apiKey ? (settings as any).apiKey.length : 0,
      apiKeyPreview: settings && (settings as any).apiKey 
        ? `${(settings as any).apiKey.substring(0, 20)}...` 
        : 'NOT CONFIGURED',
      locationId: settings && (settings as any).locationId 
        ? (settings as any).locationId 
        : 'NOT CONFIGURED',
      isEnabled: settings && (settings as any).isEnabled 
        ? (settings as any).isEnabled 
        : false,
      syncedContacts: settings && (settings as any).syncedContacts 
        ? (settings as any).syncedContacts 
        : 0,
      lastSync: settings && (settings as any).lastSync 
        ? (settings as any).lastSync 
        : 'NEVER',
      errors: settings && (settings as any).errors 
        ? (settings as any).errors 
        : []
    };

    console.log('📊 Diagnostics:', JSON.stringify(diagnostics, null, 2));

    // Test GHL API if key exists
    if (diagnostics.apiKeyConfigured) {
      console.log('🧪 Testing GHL API connection...');
      
      try {
        const response = await fetch('https://services.leadconnectorhq.com/locations/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(settings as any).apiKey}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
          }
        });

        diagnostics['ghlApiTest'] = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        };

        if (!response.ok) {
          const errorText = await response.text();
          diagnostics['ghlApiError'] = errorText;
          console.error('❌ GHL API Error:', errorText);
        } else {
          const data = await response.json();
          diagnostics['ghlApiSuccess'] = {
            locationCount: data.locations?.length || 0,
            locations: data.locations?.slice(0, 2).map((loc: any) => ({
              id: loc.id,
              name: loc.name
            })) || []
          };
          console.log('✅ GHL API Test successful');
        }
      } catch (apiError) {
        diagnostics['ghlApiException'] = apiError instanceof Error ? apiError.message : 'Unknown error';
        console.error('❌ GHL API Exception:', apiError);
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
