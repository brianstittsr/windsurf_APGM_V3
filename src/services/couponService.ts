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
  static async createCoupon(couponData: Omit<CouponCode, 'id' | 'createdAt' | 'updatedAt' | 'currentUses'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...couponData,
      currentUses: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      validFrom: Timestamp.fromDate(couponData.validFrom),
      validUntil: Timestamp.fromDate(couponData.validUntil)
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
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minimumOrderAmount: data.minimumOrderAmount,
      maxUses: data.maxUses,
      currentUses: data.currentUses,
      isActive: data.isActive,
      validFrom: data.validFrom.toDate(),
      validUntil: data.validUntil.toDate(),
      applicableServices: data.applicableServices || [],
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      createdBy: data.createdBy
    };
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
    if (now < coupon.validFrom) {
      return { isValid: false, error: 'Coupon is not yet valid' };
    }
    
    if (now > coupon.validUntil) {
      return { isValid: false, error: 'Coupon has expired' };
    }

    // Check usage limits
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return { isValid: false, error: 'Coupon usage limit exceeded' };
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount && orderAmount && orderAmount < coupon.minimumOrderAmount) {
      return { 
        isValid: false, 
        error: `Minimum order amount of $${coupon.minimumOrderAmount} required` 
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
    if (coupon.discountType === 'percentage') {
      return Math.round((orderAmount * coupon.discountValue / 100) * 100) / 100;
    } else {
      return Math.min(coupon.discountValue, orderAmount);
    }
  }

  // Apply coupon (increment usage count)
  static async applyCoupon(couponId: string): Promise<void> {
    const couponRef = doc(db, this.collectionName, couponId);
    const couponDoc = await getDoc(couponRef);
    
    if (couponDoc.exists()) {
      const currentUses = couponDoc.data().currentUses || 0;
      await updateDoc(couponRef, {
        currentUses: currentUses + 1,
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
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount,
        maxUses: data.maxUses,
        currentUses: data.currentUses,
        isActive: data.isActive,
        validFrom: data.validFrom.toDate(),
        validUntil: data.validUntil.toDate(),
        applicableServices: data.applicableServices || [],
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        createdBy: data.createdBy
      };
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
    if (updates.validFrom) {
      updateData.validFrom = Timestamp.fromDate(updates.validFrom);
    }
    if (updates.validUntil) {
      updateData.validUntil = Timestamp.fromDate(updates.validUntil);
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
