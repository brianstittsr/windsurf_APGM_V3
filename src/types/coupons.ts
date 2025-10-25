// Gift Card Types
export interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  remainingAmount: number;
  recipientEmail: string;
  recipientName: string;
  purchaserEmail: string;
  purchaserName: string;
  message?: string;
  expiresAt: Date;
  isRedeemed: boolean;
  redeemedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon Types
export interface CouponCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_service' | 'exact_amount';
  value: number;
  exactAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  expirationDate: Date;
  applicableServices?: string[];
  isActive: boolean;
  removeDepositOption?: boolean;
  depositReduction?: number; // Amount to subtract from deposit (in dollars)
  createdAt: Date;
  updatedAt: Date;
}
