import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase';
import { DatabaseService } from '@/services/database';

export async function GET(request: NextRequest) {
  try {
    const firebaseConfigured = isFirebaseConfigured();
    
    if (!firebaseConfigured) {
      return NextResponse.json({
        success: false,
        message: 'Firebase is not configured',
        firebaseConfigured: false,
        collectionsAccessible: false
      });
    }

    // Test database connection by trying to access collections
    let collectionsAccessible = false;
    try {
      // Try to get a small sample from the database
      await DatabaseService.getCollection('users').limit(1).get();
      collectionsAccessible = true;
    } catch (dbError) {
      console.error('Database access test failed:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Database status checked successfully',
      firebaseConfigured: true,
      collectionsAccessible,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      firebaseConfigured: false,
      collectionsAccessible: false
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'This endpoint only supports GET requests'
  }, { status: 405 });
}
