import { NextRequest, NextResponse } from 'next/server';

// BoldSign API base URL for US region
const BOLDSIGN_API_URL = 'https://api.boldsign.com/v1';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-boldsign-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Fetch templates from BoldSign API
    const response = await fetch(`${BOLDSIGN_API_URL}/template/list?PageSize=100`, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BoldSign API error:', response.status, errorText);
      return NextResponse.json(
        { error: `BoldSign API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform BoldSign response to our format
    const templates = (data.result || []).map((template: any) => ({
      templateId: template.templateId,
      templateName: template.title || template.name || 'Untitled Template',
      description: template.description || '',
      createdBy: template.createdBy?.name || template.senderDetail?.name || 'Unknown',
      createdDate: template.createdDate,
      modifiedDate: template.modifiedDate,
      roles: template.roles || [],
    }));

    return NextResponse.json({
      success: true,
      templates,
      totalCount: data.totalRecordsCount || templates.length,
    });
  } catch (error) {
    console.error('Error fetching BoldSign templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates from BoldSign', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, templateId, signerEmail, signerName, procedures } = body;

    if (!apiKey || !templateId || !signerEmail || !signerName) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, templateId, signerEmail, signerName' },
        { status: 400 }
      );
    }

    // Send document from template
    const response = await fetch(`${BOLDSIGN_API_URL}/template/send?templateId=${templateId}`, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `PMU Forms - ${procedures?.join(', ') || 'Procedure'}`,
        message: 'Please review and sign the attached forms for your upcoming appointment.',
        roles: [
          {
            roleIndex: 1,
            signerEmail: signerEmail,
            signerName: signerName,
            signerType: 'Signer',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BoldSign send error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to send document: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      documentId: data.documentId,
      message: 'Document sent successfully',
    });
  } catch (error) {
    console.error('Error sending BoldSign document:', error);
    return NextResponse.json(
      { error: 'Failed to send document', details: String(error) },
      { status: 500 }
    );
  }
}
