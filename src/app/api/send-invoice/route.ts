import { NextRequest, NextResponse } from 'next/server';
import { InvoiceEmailService } from '@/services/invoiceEmailService';
import { InvoiceData } from '@/types/invoice';

export async function POST(request: NextRequest) {
  try {
    const invoiceData: InvoiceData = await request.json();
    
    // Validate required fields
    if (!invoiceData.clientEmail || !invoiceData.clientName || !invoiceData.serviceName) {
      return NextResponse.json(
        { error: 'Missing required invoice data' },
        { status: 400 }
      );
    }

    console.log('📧 Sending invoice via API...');
    console.log(`   To: ${invoiceData.clientEmail}`);
    console.log(`   Service: ${invoiceData.serviceName}`);
    console.log(`   Invoice: ${invoiceData.invoiceNumber}`);

    // Send the invoice email
    const emailSent = await InvoiceEmailService.sendInvoiceEmail(invoiceData);
    
    if (emailSent) {
      console.log('✅ Invoice email sent successfully via API');
      return NextResponse.json({ 
        success: true, 
        message: 'Invoice email sent successfully',
        invoiceNumber: invoiceData.invoiceNumber
      });
    } else {
      console.log('⚠️ Invoice email failed to send via API');
      return NextResponse.json(
        { error: 'Failed to send invoice email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-invoice API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
