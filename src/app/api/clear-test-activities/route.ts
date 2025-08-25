import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';
import { USER_ACTIVITIES } from '@/services/database';

export async function POST(request: NextRequest) {
  try {
    // Delete all activities for test users (users with IDs starting with 'test-')
    const activitiesRef = DatabaseService.getCollection(USER_ACTIVITIES);
    const testActivitiesQuery = activitiesRef.where('userId', '>=', 'test-').where('userId', '<', 'test-\uf8ff');
    
    const snapshot = await testActivitiesQuery.get();
    const batch = DatabaseService.getBatch();
    
    let deleteCount = 0;
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    if (deleteCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${deleteCount} test activities`,
      deletedCount: deleteCount
    });

  } catch (error) {
    console.error('Error clearing test activities:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      deletedCount: 0
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'This endpoint only supports POST requests'
  }, { status: 405 });
}
