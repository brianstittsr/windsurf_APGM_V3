import { NextRequest, NextResponse } from 'next/server';
import { AftercareEmailService, AftercareEmailData } from '@/services/aftercareEmailService';

export async function POST(request: NextRequest) {
  try {
    const data: AftercareEmailData = await request.json();

    // Validate required fields
    if (!data.clientName || !data.clientEmail || !data.serviceType) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, clientEmail, serviceType' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.clientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log('📧 Processing aftercare email request...');
    console.log(`   Client: ${data.clientName}`);
    console.log(`   Email: ${data.clientEmail}`);
    console.log(`   Service: ${data.serviceType}`);

    // Send the aftercare email
    const success = await AftercareEmailService.sendAftercareEmail(data);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Aftercare instructions sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send aftercare email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending aftercare email:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
