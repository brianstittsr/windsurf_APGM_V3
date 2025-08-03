import { NextRequest, NextResponse } from 'next/server';
import { ClientEmailService, HealthFormEmailData } from '@/services/clientEmailService';

export async function POST(request: NextRequest) {
  try {
    const healthFormEmailData: HealthFormEmailData = await request.json();
    
    const success = await ClientEmailService.sendHealthFormEmail(healthFormEmailData);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Health form email sent successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send health form email' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error sending health form email:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
