import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { GiftCard } from '@/types/coupons';

const COLLECTION_NAME = 'giftCards';

export class GiftCardService {
  // Generate unique gift card code
  static generateGiftCardCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create a new gift card
  static async createGiftCard(giftCardData: Omit<GiftCard, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const code = this.generateGiftCardCode();
    const now = Timestamp.now();

    const newGiftCard: Omit<GiftCard, 'id'> = {
      ...giftCardData,
      code,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(getDb(), COLLECTION_NAME), newGiftCard);
    return docRef.id;
  }

  // Get gift card by code
  static async getGiftCardByCode(code: string): Promise<GiftCard | null> {
    try {
      const q = query(
        collection(getDb(), COLLECTION_NAME),
        where('code', '==', code.toUpperCase()),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        expirationDate: this.safeTimestampToDate(data.expirationDate),
        redeemedAt: this.safeTimestampToDate(data.redeemedAt),
        createdAt: this.safeTimestampToDate(data.createdAt),
        updatedAt: this.safeTimestampToDate(data.updatedAt)
      } as GiftCard;
    } catch (error) {
      console.error('Error getting gift card by code:', error);
      return null;
    }
  }

  // Get gift card by ID
  static async getGiftCardById(id: string): Promise<GiftCard | null> {
    try {
      const docRef = doc(getDb(), COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      return {
        id: docSnap.id,
        ...data,
        expirationDate: this.safeTimestampToDate(data.expirationDate),
        redeemedAt: this.safeTimestampToDate(data.redeemedAt),
        createdAt: this.safeTimestampToDate(data.createdAt),
        updatedAt: this.safeTimestampToDate(data.updatedAt)
      } as GiftCard;
    } catch (error) {
      console.error('Error getting gift card by ID:', error);
      return null;
    }
  }

  // Validate gift card for use
  static async validateGiftCard(code: string, requiredAmount: number): Promise<{
    isValid: boolean;
    giftCard?: GiftCard;
    error?: string;
  }> {
    const giftCard = await this.getGiftCardByCode(code);

    if (!giftCard) {
      return { isValid: false, error: 'Gift card not found' };
    }

    if (!giftCard.isActive) {
      return { isValid: false, error: 'Gift card is not active' };
    }

    // Handle date check safely
    if (giftCard.expirationDate) {
      let expirationDate: Date | null = null;

      // Convert to Date object safely, handling both Timestamp and Date objects
      if (typeof giftCard.expirationDate === 'object' && 'toDate' in giftCard.expirationDate && 
          typeof giftCard.expirationDate.toDate === 'function') {
        // It's a Timestamp
        expirationDate = giftCard.expirationDate.toDate();
      } else if (giftCard.expirationDate instanceof Date) {
        // It's already a Date
        expirationDate = giftCard.expirationDate;
      }

      // Check if expired
      if (expirationDate && expirationDate < new Date()) {
        return { isValid: false, error: 'Gift card has expired' };
      }
    }

    if (giftCard.remainingAmount <= 0) {
      return { isValid: false, error: 'Gift card has no remaining balance' };
    }

    // Convert requiredAmount (dollars) to cents for comparison
    const requiredAmountInCents = requiredAmount * 100;
    if (giftCard.remainingAmount < requiredAmountInCents) {
      return {
        isValid: false,
        error: `Insufficient balance. Available: $${(giftCard.remainingAmount / 100).toFixed(2)}`
      };
    }

    return { isValid: true, giftCard };
  }

  // Use gift card (deduct amount)
  static async useGiftCard(giftCardId: string, amount: number): Promise<void> {
    const giftCard = await this.getGiftCardById(giftCardId);

    if (!giftCard) {
      throw new Error('Gift card not found');
    }

    const newRemainingAmount = giftCard.remainingAmount - amount;
    const isRedeemed = newRemainingAmount <= 0;

    await updateDoc(doc(getDb(), COLLECTION_NAME, giftCardId), {
      remainingAmount: Math.max(0, newRemainingAmount),
      isRedeemed,
      updatedAt: Timestamp.now()
    });
  }

  // Update gift card
  static async updateGiftCard(id: string, updates: Partial<Omit<GiftCard, 'id' | 'code' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(getDb(), COLLECTION_NAME, id), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  // Deactivate gift card
  static async deactivateGiftCard(id: string): Promise<void> {
    await updateDoc(doc(getDb(), COLLECTION_NAME, id), {
      isActive: false,
      updatedAt: Timestamp.now()
    });
  }

  // Delete gift card
  static async deleteGiftCard(id: string): Promise<void> {
    await deleteDoc(doc(getDb(), COLLECTION_NAME, id));
  }

  // Helper function to safely convert Firestore Timestamp to Date
  private static safeTimestampToDate(timestampField: any): Date | null {
    if (!timestampField) return null;
    
    try {
      // Check if it's a Firestore Timestamp with toDate method
      if (typeof timestampField === 'object' && timestampField !== null && 
          'toDate' in timestampField && typeof timestampField.toDate === 'function') {
        return timestampField.toDate();
      }
      
      // If it's already a Date, return it
      if (timestampField instanceof Date) {
        return timestampField;
      }
      
      // Try to parse string dates
      if (typeof timestampField === 'string') {
        const parsedDate = new Date(timestampField);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
      
      console.warn('Unable to convert timestamp to date:', timestampField);
      return null;
    } catch (error) {
      console.error('Error converting timestamp to date:', error);
      return null;
    }
  }

  // Get all gift cards
  static async getAllGiftCards(): Promise<GiftCard[]> {
    const q = query(
      collection(getDb(), COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expirationDate: this.safeTimestampToDate(data.expirationDate) || new Date(),
          redeemedAt: this.safeTimestampToDate(data.redeemedAt),
          createdAt: this.safeTimestampToDate(data.createdAt) || new Date(),
          updatedAt: this.safeTimestampToDate(data.updatedAt) || new Date()
        } as GiftCard;
      });
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      return [];
    }
  }
}
