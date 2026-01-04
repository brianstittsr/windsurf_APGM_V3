import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

/**
 * Hook for creating appointments with automatic GHL sync.
 * Appointments are first saved to Firebase, then synced to GHL.
 * If GHL sync fails, the appointment is marked for retry.
 */
export function useAppointments() {
  const createAppointment = async (appointmentData: any) => {
    try {
      const appointmentsRef = collection(getDb(), 'appointments');
      
      // Create appointment in Firebase first (ensures data is never lost)
      const docRef = await addDoc(appointmentsRef, {
        ...appointmentData,
        ghlContactId: null,
        ghlAppointmentId: null,
        ghlSyncError: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      const appointmentId = docRef.id;
      
      // Attempt to sync with GHL (non-blocking)
      try {
        const syncResponse = await fetch('/api/calendar/sync-ghl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: appointmentId,
            booking: {
              clientName: appointmentData.clientName,
              clientEmail: appointmentData.clientEmail,
              clientPhone: appointmentData.clientPhone,
              serviceName: appointmentData.serviceName,
              date: appointmentData.scheduledDate || appointmentData.date,
              time: appointmentData.scheduledTime || appointmentData.time,
              status: appointmentData.status || 'pending',
              price: appointmentData.totalAmount || appointmentData.price || 0,
              depositPaid: appointmentData.depositAmount > 0,
              notes: appointmentData.specialRequests || appointmentData.notes || ''
            },
            collection: 'appointments' // Specify which collection to update
          })
        });
        
        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
          console.log('[useAppointments] GHL sync successful:', syncResult);
        } else {
          // Mark for retry - don't throw, appointment is already saved
          console.warn('[useAppointments] GHL sync failed, marked for retry');
          await updateDoc(doc(getDb(), 'appointments', appointmentId), {
            ghlSyncError: 'Initial sync failed - will retry',
            ghlSyncAttempted: Timestamp.now()
          });
        }
      } catch (syncError) {
        // GHL sync failed but appointment is saved - mark for retry
        console.error('[useAppointments] GHL sync error:', syncError);
        await updateDoc(doc(getDb(), 'appointments', appointmentId), {
          ghlSyncError: syncError instanceof Error ? syncError.message : 'Sync failed',
          ghlSyncAttempted: Timestamp.now()
        });
      }
      
      return appointmentId;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  return { createAppointment };
}
