/**
 * Loyalty Program Service
 * Manages referral codes, loyalty points, QR codes, and rewards
 */

import QRCode from 'qrcode';
import { db } from '@/lib/firebase-admin';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LoyaltyMember {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  referralCode: string;
  qrCodeUrl?: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  totalReferrals: number;
  successfulReferrals: number;
  rewards: Reward[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reward {
  id: string;
  type: 'discount' | 'free_service' | 'gift_card' | 'product';
  name: string;
  description: string;
  pointsCost: number;
  value: number;
  code?: string;
  redeemed: boolean;
  redeemedAt?: Date;
  expiresAt?: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerCode: string;
  referredClientId?: string;
  referredClientName: string;
  referredClientEmail: string;
  referredClientPhone?: string;
  status: 'pending' | 'booked' | 'completed' | 'expired';
  bookingId?: string;
  pointsAwarded: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface LoyaltyTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  minPoints: number;
  pointsMultiplier: number;
  perks: string[];
  color: string;
}

export interface LoyaltyStats {
  totalMembers: number;
  activeMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalReferrals: number;
  successfulReferrals: number;
  conversionRate: number;
  topReferrers: Array<{ name: string; referrals: number; points: number }>;
  tierDistribution: Record<string, number>;
}

// ============================================================================
// Constants
// ============================================================================

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'bronze',
    minPoints: 0,
    pointsMultiplier: 1,
    perks: ['Earn 1 point per $1 spent', 'Birthday discount 10%'],
    color: '#CD7F32'
  },
  {
    name: 'silver',
    minPoints: 500,
    pointsMultiplier: 1.25,
    perks: ['Earn 1.25 points per $1 spent', 'Birthday discount 15%', 'Priority booking'],
    color: '#C0C0C0'
  },
  {
    name: 'gold',
    minPoints: 1500,
    pointsMultiplier: 1.5,
    perks: ['Earn 1.5 points per $1 spent', 'Birthday discount 20%', 'Priority booking', 'Free touch-up'],
    color: '#FFD700'
  },
  {
    name: 'platinum',
    minPoints: 3000,
    pointsMultiplier: 2,
    perks: ['Earn 2 points per $1 spent', 'Birthday discount 25%', 'VIP booking', 'Free touch-ups', 'Exclusive events'],
    color: '#E5E4E2'
  }
];

export const REWARDS_CATALOG: Omit<Reward, 'id' | 'redeemed' | 'redeemedAt' | 'code'>[] = [
  {
    type: 'discount',
    name: '$25 Off Any Service',
    description: 'Get $25 off your next PMU service',
    pointsCost: 250,
    value: 25
  },
  {
    type: 'discount',
    name: '$50 Off Any Service',
    description: 'Get $50 off your next PMU service',
    pointsCost: 450,
    value: 50
  },
  {
    type: 'discount',
    name: '$100 Off Any Service',
    description: 'Get $100 off your next PMU service',
    pointsCost: 850,
    value: 100
  },
  {
    type: 'free_service',
    name: 'Free Brow Lamination',
    description: 'Complimentary brow lamination service',
    pointsCost: 600,
    value: 75
  },
  {
    type: 'free_service',
    name: 'Free Touch-Up Session',
    description: 'Complimentary touch-up for any previous service',
    pointsCost: 1000,
    value: 150
  },
  {
    type: 'gift_card',
    name: '$50 Gift Card',
    description: 'Gift card to share with a friend',
    pointsCost: 500,
    value: 50
  },
  {
    type: 'product',
    name: 'Aftercare Kit',
    description: 'Premium aftercare products kit',
    pointsCost: 300,
    value: 40
  }
];

export const POINTS_CONFIG = {
  perDollarSpent: 1,
  referralBonus: 100,
  referralCompletedBonus: 50,
  reviewBonus: 25,
  birthdayBonus: 50,
  firstVisitBonus: 50
};

// ============================================================================
// Loyalty Program Service
// ============================================================================

export class LoyaltyProgramService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://atlantaglamourpmu.com') {
    this.baseUrl = baseUrl;
  }

  // --------------------------------------------------------------------------
  // Member Management
  // --------------------------------------------------------------------------

  async createMember(data: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
  }): Promise<LoyaltyMember> {
    const referralCode = this.generateReferralCode(data.clientName);
    const qrCodeUrl = await this.generateQRCode(referralCode);

    const member: LoyaltyMember = {
      id: `loyalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId: data.clientId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone || '',
      referralCode,
      qrCodeUrl,
      points: POINTS_CONFIG.firstVisitBonus,
      tier: 'bronze',
      totalSpent: 0,
      totalReferrals: 0,
      successfulReferrals: 0,
      rewards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to Firestore
    if (db) {
      await db.collection('loyalty-members').doc(member.id).set(member);
    }

    return member;
  }

  async getMember(memberId: string): Promise<LoyaltyMember | null> {
    if (!db) return null;

    const doc = await db.collection('loyalty-members').doc(memberId).get();
    if (!doc.exists) return null;

    return doc.data() as LoyaltyMember;
  }

  async getMemberByEmail(email: string): Promise<LoyaltyMember | null> {
    if (!db) return null;

    const snapshot = await db.collection('loyalty-members')
      .where('clientEmail', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as LoyaltyMember;
  }

  async getMemberByReferralCode(code: string): Promise<LoyaltyMember | null> {
    if (!db) return null;

    const snapshot = await db.collection('loyalty-members')
      .where('referralCode', '==', code.toUpperCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as LoyaltyMember;
  }

  async getAllMembers(): Promise<LoyaltyMember[]> {
    if (!db) return [];

    const snapshot = await db.collection('loyalty-members')
      .orderBy('points', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as LoyaltyMember);
  }

  async updateMember(memberId: string, updates: Partial<LoyaltyMember>): Promise<void> {
    if (!db) return;

    await db.collection('loyalty-members').doc(memberId).update({
      ...updates,
      updatedAt: new Date()
    });
  }

  // --------------------------------------------------------------------------
  // Points Management
  // --------------------------------------------------------------------------

  async addPoints(memberId: string, points: number, reason: string): Promise<number> {
    const member = await this.getMember(memberId);
    if (!member) throw new Error('Member not found');

    // Apply tier multiplier
    const tier = LOYALTY_TIERS.find(t => t.name === member.tier);
    const multipliedPoints = Math.floor(points * (tier?.pointsMultiplier || 1));

    const newTotal = member.points + multipliedPoints;
    const newTier = this.calculateTier(newTotal);

    await this.updateMember(memberId, {
      points: newTotal,
      tier: newTier
    });

    // Log points transaction
    if (db) {
      await db.collection('loyalty-transactions').add({
        memberId,
        type: 'earn',
        points: multipliedPoints,
        reason,
        balanceAfter: newTotal,
        createdAt: new Date()
      });
    }

    return newTotal;
  }

  async deductPoints(memberId: string, points: number, reason: string): Promise<number> {
    const member = await this.getMember(memberId);
    if (!member) throw new Error('Member not found');

    if (member.points < points) {
      throw new Error('Insufficient points');
    }

    const newTotal = member.points - points;

    await this.updateMember(memberId, { points: newTotal });

    // Log points transaction
    if (db) {
      await db.collection('loyalty-transactions').add({
        memberId,
        type: 'redeem',
        points: -points,
        reason,
        balanceAfter: newTotal,
        createdAt: new Date()
      });
    }

    return newTotal;
  }

  async addPointsForPurchase(memberId: string, amount: number): Promise<number> {
    const points = Math.floor(amount * POINTS_CONFIG.perDollarSpent);
    return this.addPoints(memberId, points, `Purchase: $${amount}`);
  }

  // --------------------------------------------------------------------------
  // Referral Management
  // --------------------------------------------------------------------------

  async createReferral(referralCode: string, referredClient: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Referral> {
    const referrer = await this.getMemberByReferralCode(referralCode);
    if (!referrer) throw new Error('Invalid referral code');

    const referral: Referral = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      referrerId: referrer.id,
      referrerCode: referralCode,
      referredClientName: referredClient.name,
      referredClientEmail: referredClient.email,
      referredClientPhone: referredClient.phone,
      status: 'pending',
      pointsAwarded: 0,
      createdAt: new Date()
    };

    // Save referral
    if (db) {
      await db.collection('referrals').doc(referral.id).set(referral);
    }

    // Update referrer's total referrals
    await this.updateMember(referrer.id, {
      totalReferrals: referrer.totalReferrals + 1
    });

    // Award initial referral points
    await this.addPoints(referrer.id, POINTS_CONFIG.referralBonus, `Referral: ${referredClient.name}`);

    return referral;
  }

  async completeReferral(referralId: string, bookingId: string): Promise<void> {
    if (!db) return;

    const referralDoc = await db.collection('referrals').doc(referralId).get();
    if (!referralDoc.exists) throw new Error('Referral not found');

    const referral = referralDoc.data() as Referral;
    if (referral.status === 'completed') return;

    // Update referral status
    await db.collection('referrals').doc(referralId).update({
      status: 'completed',
      bookingId,
      completedAt: new Date(),
      pointsAwarded: POINTS_CONFIG.referralBonus + POINTS_CONFIG.referralCompletedBonus
    });

    // Award completion bonus to referrer
    const referrer = await this.getMember(referral.referrerId);
    if (referrer) {
      await this.addPoints(
        referrer.id,
        POINTS_CONFIG.referralCompletedBonus,
        `Referral completed: ${referral.referredClientName}`
      );

      await this.updateMember(referrer.id, {
        successfulReferrals: referrer.successfulReferrals + 1
      });
    }
  }

  async getReferralsByMember(memberId: string): Promise<Referral[]> {
    if (!db) return [];

    const snapshot = await db.collection('referrals')
      .where('referrerId', '==', memberId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Referral);
  }

  // --------------------------------------------------------------------------
  // Rewards Management
  // --------------------------------------------------------------------------

  async redeemReward(memberId: string, rewardIndex: number): Promise<Reward> {
    const member = await this.getMember(memberId);
    if (!member) throw new Error('Member not found');

    const rewardTemplate = REWARDS_CATALOG[rewardIndex];
    if (!rewardTemplate) throw new Error('Invalid reward');

    if (member.points < rewardTemplate.pointsCost) {
      throw new Error('Insufficient points');
    }

    // Create reward
    const reward: Reward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...rewardTemplate,
      code: this.generateRewardCode(),
      redeemed: false,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };

    // Deduct points
    await this.deductPoints(memberId, rewardTemplate.pointsCost, `Redeemed: ${reward.name}`);

    // Add reward to member
    const updatedRewards = [...member.rewards, reward];
    await this.updateMember(memberId, { rewards: updatedRewards });

    return reward;
  }

  async useReward(memberId: string, rewardId: string): Promise<void> {
    const member = await this.getMember(memberId);
    if (!member) throw new Error('Member not found');

    const rewardIndex = member.rewards.findIndex(r => r.id === rewardId);
    if (rewardIndex === -1) throw new Error('Reward not found');

    const reward = member.rewards[rewardIndex];
    if (reward.redeemed) throw new Error('Reward already used');

    if (reward.expiresAt && new Date(reward.expiresAt) < new Date()) {
      throw new Error('Reward has expired');
    }

    // Mark as redeemed
    member.rewards[rewardIndex] = {
      ...reward,
      redeemed: true,
      redeemedAt: new Date()
    };

    await this.updateMember(memberId, { rewards: member.rewards });
  }

  getRewardsCatalog(): typeof REWARDS_CATALOG {
    return REWARDS_CATALOG;
  }

  // --------------------------------------------------------------------------
  // QR Code Generation
  // --------------------------------------------------------------------------

  async generateQRCode(referralCode: string): Promise<string> {
    const referralUrl = `${this.baseUrl}/refer/${referralCode}`;
    
    try {
      const qrDataUrl = await QRCode.toDataURL(referralUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#8B5CF6',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  async regenerateQRCode(memberId: string): Promise<string> {
    const member = await this.getMember(memberId);
    if (!member) throw new Error('Member not found');

    const qrCodeUrl = await this.generateQRCode(member.referralCode);
    await this.updateMember(memberId, { qrCodeUrl });

    return qrCodeUrl;
  }

  // --------------------------------------------------------------------------
  // Statistics
  // --------------------------------------------------------------------------

  async getStats(): Promise<LoyaltyStats> {
    const members = await this.getAllMembers();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalPointsIssued = 0;
    let totalPointsRedeemed = 0;
    let totalReferrals = 0;
    let successfulReferrals = 0;

    const tierDistribution: Record<string, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0
    };

    const activeMembers = members.filter(m => {
      const updatedAt = m.updatedAt instanceof Date ? m.updatedAt : new Date(m.updatedAt);
      return updatedAt > thirtyDaysAgo;
    });

    for (const member of members) {
      totalPointsIssued += member.points;
      totalReferrals += member.totalReferrals;
      successfulReferrals += member.successfulReferrals;
      tierDistribution[member.tier]++;

      for (const reward of member.rewards) {
        if (reward.redeemed) {
          totalPointsRedeemed += reward.pointsCost;
        }
      }
    }

    const topReferrers = members
      .filter(m => m.successfulReferrals > 0)
      .sort((a, b) => b.successfulReferrals - a.successfulReferrals)
      .slice(0, 10)
      .map(m => ({
        name: m.clientName,
        referrals: m.successfulReferrals,
        points: m.points
      }));

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalPointsIssued,
      totalPointsRedeemed,
      totalReferrals,
      successfulReferrals,
      conversionRate: totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0,
      topReferrers,
      tierDistribution
    };
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private generateReferralCode(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${random}`;
  }

  private generateRewardCode(): string {
    return `RWD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  private calculateTier(points: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    for (let i = LOYALTY_TIERS.length - 1; i >= 0; i--) {
      if (points >= LOYALTY_TIERS[i].minPoints) {
        return LOYALTY_TIERS[i].name;
      }
    }
    return 'bronze';
  }

  getTierInfo(tier: string): LoyaltyTier | undefined {
    return LOYALTY_TIERS.find(t => t.name === tier);
  }

  getNextTier(currentTier: string): LoyaltyTier | null {
    const currentIndex = LOYALTY_TIERS.findIndex(t => t.name === currentTier);
    if (currentIndex === -1 || currentIndex === LOYALTY_TIERS.length - 1) {
      return null;
    }
    return LOYALTY_TIERS[currentIndex + 1];
  }

  getPointsToNextTier(currentPoints: number, currentTier: string): number {
    const nextTier = this.getNextTier(currentTier);
    if (!nextTier) return 0;
    return Math.max(0, nextTier.minPoints - currentPoints);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createLoyaltyService(baseUrl?: string): LoyaltyProgramService {
  return new LoyaltyProgramService(baseUrl);
}
