import { NextRequest, NextResponse } from 'next/server';
import { EnhancedEmailService } from '@/services/enhancedEmailService';

export async function POST(request: NextRequest) {
  try {
    const { consentData, clientId, appointmentId } = await request.json();
    
    const result = await EnhancedEmailService.generateConsentFormPDF(
      consentData,
      {
        clientId,
        appointmentId,
        generatePDF: true,
        storePDFInProfile: true
      }
    );
    
    if (result.pdfUrl) {
      return NextResponse.json({ 
        success: true, 
        message: 'Consent form PDF generated successfully',
        pdfUrl: result.pdfUrl,
        pdfId: result.pdfId
      });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to generate consent PDF' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error generating consent PDF:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
