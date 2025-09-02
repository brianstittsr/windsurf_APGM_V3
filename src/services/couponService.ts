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
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CouponCode } from '@/types/database';

export class CouponService {
  private static collectionName = 'coupons';

  // Create a new coupon code
  static async createCoupon(couponData: {
    code: string;
    description: string;
    type: 'percentage' | 'fixed' | 'free_service';
    value: number;
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
      where('code', '==', code.toUpperCase()),
      where('isActive', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      code: data.code,
      type: data.type,
      value: data.value,
      description: data.description,
      minOrderAmount: data.minOrderAmount,
      maxDiscountAmount: data.maxDiscountAmount,
      usageLimit: data.usageLimit,
      usageCount: data.usageCount || 0,
      isActive: data.isActive,
      expirationDate: data.expirationDate,
      applicableServices: data.applicableServices || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as CouponCode;
  }

  // Validate coupon code
  static async validateCoupon(code: string, serviceId?: string, orderAmount?: number): Promise<{
    isValid: boolean;
    coupon?: CouponCode;
    error?: string;
  }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { isValid: false, error: 'Coupon code not found' };
    }

    const now = new Date();
    
    // Check if coupon is expired
    if (coupon.expirationDate && now > coupon.expirationDate.toDate()) {
      return { isValid: false, error: 'Coupon has expired' };
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { isValid: false, error: 'Coupon usage limit exceeded' };
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount && orderAmount < coupon.minOrderAmount) {
      return { 
        isValid: false, 
        error: `Minimum order amount of $${coupon.minOrderAmount} required` 
      };
    }

    // Check service applicability
    if (coupon.applicableServices && coupon.applicableServices.length > 0 && serviceId) {
      if (!coupon.applicableServices.includes(serviceId)) {
        return { isValid: false, error: 'Coupon not applicable to selected service' };
      }
    }

    return { isValid: true, coupon };
  }

  // Calculate discount amount
  static calculateDiscount(coupon: CouponCode, orderAmount: number): number {
    if (coupon.type === 'percentage') {
      // For percentage discounts, calculate percentage of order amount
      const discount = (orderAmount * coupon.value) / 100;
      return Math.round(discount * 100) / 100; // Round to 2 decimal places
    } else if (coupon.type === 'free_service') {
      // For free service, discount is 100% of order amount
      return orderAmount;
    } else {
      // For fixed amount discounts, use the coupon value but don't exceed order amount
      return Math.min(coupon.value, orderAmount);
    }
  }

  // Apply coupon (increment usage count)
  static async applyCoupon(couponId: string): Promise<void> {
    const couponRef = doc(db, this.collectionName, couponId);
    const couponDoc = await getDoc(couponRef);
    
    if (couponDoc.exists()) {
      const currentUses = couponDoc.data().usageCount || 0;
      await updateDoc(couponRef, {
        usageCount: currentUses + 1,
        updatedAt: Timestamp.now()
      });
    }
  }

  // Get all coupons (admin function)
  static async getAllCoupons(): Promise<CouponCode[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        code: data.code,
        type: data.type,
        value: data.value,
        description: data.description,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        usageLimit: data.usageLimit,
        usageCount: data.usageCount || 0,
        isActive: data.isActive,
        expirationDate: data.expirationDate,
        applicableServices: data.applicableServices || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as CouponCode;
    });
  }

  // Update coupon
  static async updateCoupon(couponId: string, updates: Partial<Omit<CouponCode, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const couponRef = doc(db, this.collectionName, couponId);
    
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    // Convert dates to Timestamps if provided
    if (updates.expirationDate && updates.expirationDate instanceof Date) {
      updateData.expirationDate = Timestamp.fromDate(updates.expirationDate);
    }

    await updateDoc(couponRef, updateData);
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
}
