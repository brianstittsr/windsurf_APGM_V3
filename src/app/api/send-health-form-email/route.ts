import { NextRequest, NextResponse } from 'next/server';
import { HealthFormEmailData } from '@/services/clientEmailService';
import { EnhancedEmailService } from '@/services/enhancedEmailService';

export async function POST(request: NextRequest) {
  try {
    const { healthFormEmailData, clientId, appointmentId, generatePDF = true } = await request.json();
    
    const result = await EnhancedEmailService.sendHealthFormEmailWithPDF(
      healthFormEmailData,
      {
        clientId,
        appointmentId,
        generatePDF,
        storePDFInProfile: true
      }
    );
    
    if (result.emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Health form email sent successfully',
        pdfGenerated: !!result.pdfUrl,
        pdfUrl: result.pdfUrl,
        pdfId: result.pdfId
      });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send health form email' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error sending health form email:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
