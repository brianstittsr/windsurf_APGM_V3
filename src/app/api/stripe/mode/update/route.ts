import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { mode, adminUserId } = await request.json();

    // Validate input
    if (!mode || !['test', 'live'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "test" or "live"' },
        { status: 400 }
      );
    }

    if (!adminUserId) {
      return NextResponse.json(
        { error: 'Admin user ID is required' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    const userDoc = await getDoc(doc(db, 'users', adminUserId));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Update system configuration in Firestore
    const configRef = doc(db, 'systemConfig', 'stripe');
    await updateDoc(configRef, {
      mode: mode,
      updatedAt: new Date(),
      updatedBy: adminUserId
    });

    // Log the change
    console.log(`🔧 Stripe mode changed to ${mode.toUpperCase()} by admin ${adminUserId}`);

    return NextResponse.json({
      success: true,
      mode: mode,
      message: `Stripe mode updated to ${mode} successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating Stripe mode:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update Stripe mode',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
