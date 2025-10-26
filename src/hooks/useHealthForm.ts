import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export function useHealthForm() {
  const submitHealthForm = async (healthFormData: any, signature: string) => {
    try {
      const healthFormsRef = collection(getDb(), 'healthForms');
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
