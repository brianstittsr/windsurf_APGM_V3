import { NextRequest, NextResponse } from 'next/server';
import { EnhancedEmailService } from '@/services/enhancedEmailService';

export async function POST(request: NextRequest) {
  try {
    const { paymentData, clientId, appointmentId } = await request.json();
    
    const result = await EnhancedEmailService.generatePaymentConfirmationPDF(
      paymentData,
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
        message: 'Payment confirmation PDF generated successfully',
        pdfUrl: result.pdfUrl,
        pdfId: result.pdfId
      });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to generate payment PDF' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error generating payment PDF:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
