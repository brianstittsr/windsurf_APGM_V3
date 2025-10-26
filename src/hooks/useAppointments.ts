import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export function useAppointments() {
  const createAppointment = async (appointmentData: any) => {
    try {
      const appointmentsRef = collection(getDb(), 'appointments');
      const docRef = await addDoc(appointmentsRef, {
        ...appointmentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  return { createAppointment };
}
