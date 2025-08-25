import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { UserService } from '@/services/database';

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
    const { email, password, firstName, lastName, phone } = await request.json();

    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required: email, password, firstName, lastName, phone'
      }, { status: 400 });
    }

    const auth = getAuth();
    
    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    });

    // Create user profile in Firestore
    const userProfileData = {
      email,
      firstName,
      lastName,
      phone,
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      hearAboutUs: 'Admin Created',
      role: 'client'
    };

    await UserService.createUser(userRecord.uid, userProfileData);

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    let message = 'Failed to create user';
    if (error.code === 'auth/email-already-exists') {
      message = 'Email already exists';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email format';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak';
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
