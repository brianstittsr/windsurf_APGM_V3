import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    initializeApp({
      credential: cert(serviceAccount as any),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required'
      }, { status: 400 });
    }

    const auth = getAuth();
    
    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);
    
    // In a real app, you would send this via email service
    // For now, we'll just return it for testing
    return NextResponse.json({
      success: true,
      message: 'Password reset link generated',
      resetLink: resetLink,
      note: 'In production, this would be sent via email'
    });

  } catch (error: any) {
    console.error('Error generating password reset:', error);
    
    let message = 'Failed to generate password reset';
    if (error.code === 'auth/user-not-found') {
      message = 'No user found with this email address';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email format';
    }

    return NextResponse.json({
      success: false,
      message: error.message || message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'This endpoint only supports POST requests'
  }, { status: 405 });
}
