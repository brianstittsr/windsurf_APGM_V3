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
import { CouponCode } from '@/types/coupons';

export class CouponService {
  private static collectionName = 'coupons';

  // Create a new coupon code
  static async createCoupon(couponData: {
    code: string;
    description: string;
    type: 'percentage' | 'fixed' | 'free_service' | 'exact_amount';
    value: number;
    exactAmount?: number;
    minOrderAmount?: number;
    usageLimit?: number;
    expirationDate: Date;
    applicableServices?: string[];
    isActive: boolean;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      code: couponData.code,
      type: couponData.type,
      value: couponData.type === 'free_service' ? 100 : couponData.value,
      exactAmount: couponData.exactAmount,
      description: couponData.description,
      minOrderAmount: couponData.minOrderAmount,
      usageLimit: couponData.usageLimit,
      usageCount: 0,
      isActive: couponData.isActive,
      expirationDate: Timestamp.fromDate(couponData.expirationDate),
      applicableServices: couponData.applicableServices || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  // Get coupon by code
  static async getCouponByCode(code: string): Promise<CouponCode | null> {
    const q = query(
      collection(db, this.collectionName),
      where('code', '==', code.toUpperCase())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      expirationDate: doc.data().expirationDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as CouponCode;
  }

  // Get coupon by ID
  static async getCouponById(id: string): Promise<CouponCode | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      expirationDate: docSnap.data().expirationDate?.toDate(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate()
    } as CouponCode;
  }

  // Update coupon
  static async updateCoupon(couponId: string, updates: Partial<CouponCode>): Promise<void> {
    const updateData: any = { ...updates, updatedAt: Timestamp.now() };

    // Convert Date objects to Timestamps
    if (updates.expirationDate) {
      updateData.expirationDate = Timestamp.fromDate(updates.expirationDate);
    }

    await updateDoc(doc(db, this.collectionName, couponId), updateData);
  }

  // Validate coupon for use
  static async validateCoupon(code: string, orderAmount: number, serviceId?: string): Promise<{
    isValid: boolean;
    coupon?: CouponCode;
    error?: string;
  }> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return { isValid: false, error: 'Coupon not found' };
    }

    if (!coupon.isActive) {
      return { isValid: false, error: 'Coupon is not active' };
    }

    if (coupon.expirationDate && coupon.expirationDate < new Date()) {
      return { isValid: false, error: 'Coupon has expired' };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { isValid: false, error: 'Coupon usage limit exceeded' };
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return { isValid: false, error: 'Order amount does not meet minimum requirement' };
    }

    if (coupon.applicableServices && coupon.applicableServices.length > 0 && serviceId) {
      if (!coupon.applicableServices.includes(serviceId)) {
        return { isValid: false, error: 'Coupon not applicable to selected service' };
      }
    }

    return { isValid: true, coupon };
  }

  // Calculate discount
  static calculateDiscount(coupon: CouponCode, orderAmount: number): number {
    if (coupon.type === 'percentage') {
      return (orderAmount * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.value, orderAmount);
    } else if (coupon.type === 'free_service') {
      return orderAmount; // 100% discount
    } else if (coupon.type === 'exact_amount' && coupon.exactAmount) {
      return Math.min(coupon.exactAmount, orderAmount);
    }
    return 0;
  }

  // Use coupon (increment usage count)
  static async useCoupon(couponId: string): Promise<void> {
    const coupon = await this.getCouponById(couponId);
    if (coupon) {
      await this.updateCoupon(couponId, {
        usageCount: coupon.usageCount + 1
      });
    }
  }

  // Delete coupon
  static async deleteCoupon(couponId: string): Promise<void> {
    const couponRef = doc(db, this.collectionName, couponId);
    await deleteDoc(couponRef);
  }

  // Deactivate coupon (soft delete)
  static async deactivateCoupon(couponId: string): Promise<void> {
    await this.updateCoupon(couponId, {
      isActive: false
    });
  }

  // Get all coupons
  static async getAllCoupons(): Promise<CouponCode[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expirationDate: doc.data().expirationDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as CouponCode));
  }
}
