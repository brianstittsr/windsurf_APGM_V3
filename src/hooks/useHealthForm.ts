import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useHealthForm() {
  const submitHealthForm = async (healthFormData: any, signature: string) => {
    try {
      const healthFormsRef = collection(db, 'healthForms');
      const docRef = await addDoc(healthFormsRef, {
        ...healthFormData,
        signature,
        submittedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting health form:', error);
      throw error;
    }
  };

  return { submitHealthForm };
}
