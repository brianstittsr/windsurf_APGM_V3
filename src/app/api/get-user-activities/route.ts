import { NextRequest, NextResponse } from 'next/server';
import { ActivityService } from '@/services/activityService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const activityType = searchParams.get('activityType');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameter: userId'
      }, { status: 400 });
    }

    const filters: any = { limit };
    
    if (activityType) {
      filters.activityTypes = [activityType];
    }

    const activities = await ActivityService.getUserActivities(userId, filters);

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length
    });

  } catch (error) {
    console.error('Error getting user activities:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      activities: []
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'This endpoint only supports GET requests'
  }, { status: 405 });
}
