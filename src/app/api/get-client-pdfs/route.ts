import { NextRequest, NextResponse } from 'next/server';
import { EnhancedEmailService } from '@/services/enhancedEmailService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const appointmentId = searchParams.get('appointmentId');
    
    if (!clientId && !appointmentId) {
      return NextResponse.json({ error: 'Either clientId or appointmentId is required' }, { status: 400 });
    }
    
    let pdfs;
    if (appointmentId) {
      pdfs = await EnhancedEmailService.getAppointmentPDFs(appointmentId);
    } else {
      pdfs = await EnhancedEmailService.getClientPDFs(clientId!);
    }
    
    return NextResponse.json({ 
      success: true, 
      pdfs,
      count: pdfs.length
    });
  } catch (error) {
    console.error('API Error retrieving PDFs:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
