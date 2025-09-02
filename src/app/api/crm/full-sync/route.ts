import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';
import { createGoHighLevelService } from '@/services/gohighlevelService';

export async function POST(request: NextRequest) {
  try {
    const ghlService = createGoHighLevelService();
    if (!ghlService) {
      return NextResponse.json(
        { error: 'GoHighLevel service not configured' },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    let syncedContacts = 0;
    let syncedWorkflows = 0;

    try {
      // Sync contacts from booking system to CRM
      const bookings = await DatabaseService.getCollection('appointments');
      const existingContacts = await ghlService.getContacts();
      
      for (const booking of bookings) {
        try {
          const existingContact = existingContacts.find((c: any) => c.email === booking.email);
          
          if (!existingContact) {
            await ghlService.createContact({
              firstName: booking.firstName,
              lastName: booking.lastName,
              email: booking.email,
              phone: booking.phone,
              source: 'Booking System',
              tags: ['Client', booking.serviceType || 'Unknown Service']
            });
            syncedContacts++;
          }
        } catch (contactError) {
          errors.push(`Failed to sync contact ${booking.email}: ${contactError}`);
        }
      }

      // Get workflow count
      const workflows = await ghlService.getWorkflows();
      syncedWorkflows = workflows.length;

    } catch (syncError) {
      errors.push(`Sync operation failed: ${syncError}`);
    }

    // Update sync status
    const syncStatus = {
      isEnabled: true,
      lastSync: new Date().toISOString(),
      syncedContacts,
      syncedWorkflows,
      errors
    };

    await DatabaseService.updateDocument('crmSettings', 'syncStatus', syncStatus);

    return NextResponse.json({
      success: true,
      syncedContacts,
      syncedWorkflows,
      errors
    });

  } catch (error) {
    console.error('Full sync failed:', error);
    return NextResponse.json(
      { error: 'Full sync failed' },
      { status: 500 }
    );
  }
}
