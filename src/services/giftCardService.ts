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
import { db } from '@/lib/firebase';
import { GiftCard } from '@/types/database';

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

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newGiftCard);
    return docRef.id;
  }

  // Get gift card by code
  static async getGiftCardByCode(code: string): Promise<GiftCard | null> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('code', '==', code.toUpperCase()),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as GiftCard;
  }

  // Get gift card by ID
  static async getGiftCardById(id: string): Promise<GiftCard | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return { id: docSnap.id, ...docSnap.data() } as GiftCard;
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
    
    if (giftCard.expirationDate && giftCard.expirationDate.toDate() < new Date()) {
      return { isValid: false, error: 'Gift card has expired' };
    }
    
    if (giftCard.remainingAmount <= 0) {
      return { isValid: false, error: 'Gift card has no remaining balance' };
    }
    
    if (giftCard.remainingAmount < requiredAmount) {
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
    
    await updateDoc(doc(db, COLLECTION_NAME, giftCardId), {
      remainingAmount: Math.max(0, newRemainingAmount),
      isRedeemed,
      updatedAt: Timestamp.now()
    });
  }

  // Get all gift cards (admin)
  static async getAllGiftCards(): Promise<GiftCard[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GiftCard[];
  }

  // Update gift card
  static async updateGiftCard(id: string, updates: Partial<Omit<GiftCard, 'id' | 'code' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  // Deactivate gift card
  static async deactivateGiftCard(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      isActive: false,
      updatedAt: Timestamp.now()
    });
  }

  // Delete gift card
  static async deleteGiftCard(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
}
