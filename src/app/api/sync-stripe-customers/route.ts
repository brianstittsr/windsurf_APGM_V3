import { NextResponse } from 'next/server';
import { stripeCustomerSyncService } from '@/services/stripeCustomerSync';
import { db } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { userId, bulk = false } = await request.json();

    if (bulk) {
      // Bulk sync all users without Stripe customer IDs
      const result = await stripeCustomerSyncService.bulkSyncUsers();
      
      return NextResponse.json({
        success: true,
        message: `Bulk sync completed: ${result.synced} synced, ${result.errors} errors`,
        ...result
      });
    } else if (userId) {
      // Sync specific user
      // Note: In a real implementation, you'd fetch the user from Firebase first
      // For now, this is a placeholder that would need the full user object
      return NextResponse.json({
        success: false,
        message: 'Individual sync requires full user object - not implemented yet'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Either userId or bulk=true is required'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in sync-stripe-customers:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
