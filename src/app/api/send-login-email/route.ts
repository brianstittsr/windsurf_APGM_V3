import { NextRequest, NextResponse } from 'next/server';
import { ClientEmailService, LoginEmailData } from '@/services/clientEmailService';

export async function POST(request: NextRequest) {
  try {
    const loginEmailData: LoginEmailData = await request.json();
    
    const success = await ClientEmailService.sendLoginEmail(loginEmailData);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Login email sent successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send login email' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error sending login email:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
