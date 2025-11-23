import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET() {
  try {
    console.log('[test-firebase-admin] Starting diagnostic...');
    
    // Check if environment variables exist
    const hasProjectId = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
    
    console.log('[test-firebase-admin] Environment variables check:');
    console.log(`  - NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${hasProjectId}`);
    console.log(`  - FIREBASE_CLIENT_EMAIL: ${hasClientEmail}`);
    console.log(`  - FIREBASE_PRIVATE_KEY: ${hasPrivateKey}`);
    
    if (!hasProjectId || !hasClientEmail || !hasPrivateKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          hasProjectId,
          hasClientEmail,
          hasPrivateKey
        }
      }, { status: 500 });
    }
    
    // Try to initialize Firebase Admin
    if (!getApps().length) {
      console.log('[test-firebase-admin] Initializing Firebase Admin...');
      const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
      
      initializeApp({
        credential: cert(serviceAccount as any),
      });
      console.log('[test-firebase-admin] Firebase Admin initialized');
    }
    
    // Try to get Firestore instance
    console.log('[test-firebase-admin] Getting Firestore instance...');
    const db = getFirestore();
    console.log('[test-firebase-admin] Firestore instance obtained');
    
    // Try to read from Firestore
    console.log('[test-firebase-admin] Testing Firestore read...');
    const testCollection = await db.collection('crmSettings').limit(1).get();
    console.log(`[test-firebase-admin] Firestore read successful (${testCollection.size} docs)`);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working correctly',
      details: {
        hasProjectId,
        hasClientEmail,
        hasPrivateKey,
        firestoreConnected: true,
        testCollectionSize: testCollection.size
      }
    });
    
  } catch (error) {
    console.error('[test-firebase-admin] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
