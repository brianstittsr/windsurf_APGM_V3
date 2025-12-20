/**
 * Loyalty Program API Endpoint
 * Manages members, points, referrals, and rewards
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createLoyaltyService,
  LoyaltyProgramService,
  LOYALTY_TIERS,
  REWARDS_CATALOG,
  POINTS_CONFIG
} from '@/services/loyalty-program';

// Initialize service lazily
let loyaltyService: LoyaltyProgramService | null = null;

function getService(): LoyaltyProgramService {
  if (!loyaltyService) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://atlantaglamourpmu.com';
    loyaltyService = createLoyaltyService(baseUrl);
  }
  return loyaltyService;
}

// ============================================================================
// POST - Loyalty operations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const service = getService();

    switch (action) {
      // Create new member
      case 'create_member': {
        const { clientId, clientName, clientEmail, clientPhone } = body;
        if (!clientId || !clientName || !clientEmail) {
          return NextResponse.json(
            { error: 'clientId, clientName, and clientEmail are required' },
            { status: 400 }
          );
        }

        // Check if member already exists
        const existing = await service.getMemberByEmail(clientEmail);
        if (existing) {
          return NextResponse.json({ 
            success: true, 
            member: existing,
            message: 'Member already exists'
          });
        }

        const member = await service.createMember({
          clientId,
          clientName,
          clientEmail,
          clientPhone
        });
        return NextResponse.json({ success: true, member });
      }

      // Get member by ID
      case 'get_member': {
        const { memberId } = body;
        if (!memberId) {
          return NextResponse.json(
            { error: 'memberId is required' },
            { status: 400 }
          );
        }
        const member = await service.getMember(memberId);
        if (!member) {
          return NextResponse.json(
            { error: 'Member not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, member });
      }

      // Get member by email
      case 'get_member_by_email': {
        const { email } = body;
        if (!email) {
          return NextResponse.json(
            { error: 'email is required' },
            { status: 400 }
          );
        }
        const member = await service.getMemberByEmail(email);
        return NextResponse.json({ success: true, member });
      }

      // Get member by referral code
      case 'get_member_by_code': {
        const { referralCode } = body;
        if (!referralCode) {
          return NextResponse.json(
            { error: 'referralCode is required' },
            { status: 400 }
          );
        }
        const member = await service.getMemberByReferralCode(referralCode);
        return NextResponse.json({ success: true, member });
      }

      // Get all members
      case 'list_members': {
        const members = await service.getAllMembers();
        return NextResponse.json({ success: true, members });
      }

      // Add points
      case 'add_points': {
        const { memberId, points, reason } = body;
        if (!memberId || !points) {
          return NextResponse.json(
            { error: 'memberId and points are required' },
            { status: 400 }
          );
        }
        const newBalance = await service.addPoints(memberId, points, reason || 'Manual adjustment');
        return NextResponse.json({ success: true, newBalance });
      }

      // Add points for purchase
      case 'add_purchase_points': {
        const { memberId, amount } = body;
        if (!memberId || !amount) {
          return NextResponse.json(
            { error: 'memberId and amount are required' },
            { status: 400 }
          );
        }
        const newBalance = await service.addPointsForPurchase(memberId, amount);
        return NextResponse.json({ success: true, newBalance });
      }

      // Create referral
      case 'create_referral': {
        const { referralCode, referredClient } = body;
        if (!referralCode || !referredClient?.name || !referredClient?.email) {
          return NextResponse.json(
            { error: 'referralCode and referredClient (name, email) are required' },
            { status: 400 }
          );
        }
        const referral = await service.createReferral(referralCode, referredClient);
        return NextResponse.json({ success: true, referral });
      }

      // Complete referral
      case 'complete_referral': {
        const { referralId, bookingId } = body;
        if (!referralId || !bookingId) {
          return NextResponse.json(
            { error: 'referralId and bookingId are required' },
            { status: 400 }
          );
        }
        await service.completeReferral(referralId, bookingId);
        return NextResponse.json({ success: true, message: 'Referral completed' });
      }

      // Get referrals by member
      case 'get_referrals': {
        const { memberId } = body;
        if (!memberId) {
          return NextResponse.json(
            { error: 'memberId is required' },
            { status: 400 }
          );
        }
        const referrals = await service.getReferralsByMember(memberId);
        return NextResponse.json({ success: true, referrals });
      }

      // Redeem reward
      case 'redeem_reward': {
        const { memberId, rewardIndex } = body;
        if (!memberId || rewardIndex === undefined) {
          return NextResponse.json(
            { error: 'memberId and rewardIndex are required' },
            { status: 400 }
          );
        }
        const reward = await service.redeemReward(memberId, rewardIndex);
        return NextResponse.json({ success: true, reward });
      }

      // Use reward
      case 'use_reward': {
        const { memberId, rewardId } = body;
        if (!memberId || !rewardId) {
          return NextResponse.json(
            { error: 'memberId and rewardId are required' },
            { status: 400 }
          );
        }
        await service.useReward(memberId, rewardId);
        return NextResponse.json({ success: true, message: 'Reward used' });
      }

      // Get rewards catalog
      case 'get_rewards_catalog': {
        return NextResponse.json({ 
          success: true, 
          rewards: REWARDS_CATALOG 
        });
      }

      // Regenerate QR code
      case 'regenerate_qr': {
        const { memberId } = body;
        if (!memberId) {
          return NextResponse.json(
            { error: 'memberId is required' },
            { status: 400 }
          );
        }
        const qrCodeUrl = await service.regenerateQRCode(memberId);
        return NextResponse.json({ success: true, qrCodeUrl });
      }

      // Get stats
      case 'get_stats': {
        const stats = await service.getStats();
        return NextResponse.json({ success: true, stats });
      }

      // Get tier info
      case 'get_tiers': {
        return NextResponse.json({ 
          success: true, 
          tiers: LOYALTY_TIERS 
        });
      }

      // Get points config
      case 'get_points_config': {
        return NextResponse.json({ 
          success: true, 
          config: POINTS_CONFIG 
        });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            validActions: [
              'create_member',
              'get_member',
              'get_member_by_email',
              'get_member_by_code',
              'list_members',
              'add_points',
              'add_purchase_points',
              'create_referral',
              'complete_referral',
              'get_referrals',
              'redeem_reward',
              'use_reward',
              'get_rewards_catalog',
              'regenerate_qr',
              'get_stats',
              'get_tiers',
              'get_points_config'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Loyalty API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Quick lookups
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const service = getService();

    switch (action) {
      case 'stats':
        const stats = await service.getStats();
        return NextResponse.json({ success: true, stats });

      case 'tiers':
        return NextResponse.json({ success: true, tiers: LOYALTY_TIERS });

      case 'rewards':
        return NextResponse.json({ success: true, rewards: REWARDS_CATALOG });

      case 'config':
        return NextResponse.json({ success: true, config: POINTS_CONFIG });

      case 'member':
        const email = searchParams.get('email');
        const code = searchParams.get('code');
        
        if (email) {
          const member = await service.getMemberByEmail(email);
          return NextResponse.json({ success: true, member });
        }
        if (code) {
          const member = await service.getMemberByReferralCode(code);
          return NextResponse.json({ success: true, member });
        }
        return NextResponse.json(
          { error: 'email or code parameter required' },
          { status: 400 }
        );

      default:
        return NextResponse.json({
          status: 'active',
          endpoint: 'Loyalty Program API',
          actions: ['stats', 'tiers', 'rewards', 'config', 'member']
        });
    }
  } catch (error: any) {
    console.error('Loyalty API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}
