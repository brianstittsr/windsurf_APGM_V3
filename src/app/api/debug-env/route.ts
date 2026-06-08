import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== Environment Debug API Called ===');
  
  return NextResponse.json({
    message: 'Environment variables check',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      SMTP_HOST: !!process.env.SMTP_HOST ? 'configured' : 'missing',
      SMTP_PORT: process.env.SMTP_PORT || 'missing',
      SMTP_USER: !!process.env.SMTP_USER ? 'configured' : 'missing', 
      SMTP_PASS: !!process.env.SMTP_PASS ? 'configured' : 'missing',
      GHL_API_KEY: process.env.GHL_API_KEY ? `set (${process.env.GHL_API_KEY.substring(0, 15)}...)` : 'MISSING',
      GHL_LOCATION_ID: process.env.GHL_LOCATION_ID ? `set (${process.env.GHL_LOCATION_ID})` : 'MISSING',
      GHL_CALENDAR_ID: process.env.GHL_CALENDAR_ID ? `set (${process.env.GHL_CALENDAR_ID})` : 'MISSING',
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('SMTP') || key.includes('EMAIL') || key.includes('MAIL') || key.includes('GHL')
      ),
      totalEnvVars: Object.keys(process.env).length
    },
    timestamp: new Date().toISOString()
  });
}
