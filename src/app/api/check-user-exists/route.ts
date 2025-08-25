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
    
    try {
      const userRecord = await auth.getUserByEmail(email);
      
      return NextResponse.json({
        success: true,
        exists: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          createdAt: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
          providerData: userRecord.providerData
        }
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({
          success: true,
          exists: false,
          message: 'User not found'
        });
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Error checking user exists:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to check user'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'This endpoint only supports POST requests'
  }, { status: 405 });
}
