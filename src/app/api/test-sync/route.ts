import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { bulk = false } = await request.json();

    if (bulk) {
      // Mock bulk sync for testing
      return NextResponse.json({
        success: true,
        message: 'Test bulk sync completed successfully',
        synced: 5,
        errors: 0
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Test endpoint working - add bulk=true for bulk sync test'
    });
  } catch (error) {
    console.error('Error in test-sync:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
