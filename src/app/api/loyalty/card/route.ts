/**
 * Loyalty Card PDF Generation API
 * Generates printable loyalty and referral cards
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCardGenerator, CardData } from '@/services/loyalty-card-generator';
import { createLoyaltyService } from '@/services/loyalty-program';

// ============================================================================
// POST - Generate PDF cards
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, memberId, memberIds } = body;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://atlantaglamourpmu.com';
    const cardGenerator = createCardGenerator(baseUrl);
    const loyaltyService = createLoyaltyService(baseUrl);

    switch (action) {
      // Generate single loyalty card
      case 'generate_loyalty_card': {
        if (!memberId) {
          return NextResponse.json(
            { error: 'memberId is required' },
            { status: 400 }
          );
        }

        const member = await loyaltyService.getMember(memberId);
        if (!member) {
          return NextResponse.json(
            { error: 'Member not found' },
            { status: 404 }
          );
        }

        const cardData: CardData = {
          memberName: member.clientName,
          referralCode: member.referralCode,
          tier: member.tier,
          points: member.points,
          memberId: member.id
        };

        const pdfBytes = await cardGenerator.generateSingleCard(cardData);

        return new NextResponse(pdfBytes as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="loyalty-card-${member.referralCode}.pdf"`
          }
        });
      }

      // Generate referral card (to give to friends)
      case 'generate_referral_card': {
        if (!memberId) {
          return NextResponse.json(
            { error: 'memberId is required' },
            { status: 400 }
          );
        }

        const member = await loyaltyService.getMember(memberId);
        if (!member) {
          return NextResponse.json(
            { error: 'Member not found' },
            { status: 404 }
          );
        }

        const cardData: CardData = {
          memberName: member.clientName,
          referralCode: member.referralCode,
          tier: member.tier,
          points: member.points,
          memberId: member.id
        };

        const pdfBytes = await cardGenerator.generateReferralCard(cardData);

        return new NextResponse(pdfBytes as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="referral-card-${member.referralCode}.pdf"`
          }
        });
      }

      // Generate batch cards (multiple members)
      case 'generate_batch': {
        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
          return NextResponse.json(
            { error: 'memberIds array is required' },
            { status: 400 }
          );
        }

        const cardsData: CardData[] = [];

        for (const id of memberIds) {
          const member = await loyaltyService.getMember(id);
          if (member) {
            cardsData.push({
              memberName: member.clientName,
              referralCode: member.referralCode,
              tier: member.tier,
              points: member.points,
              memberId: member.id
            });
          }
        }

        if (cardsData.length === 0) {
          return NextResponse.json(
            { error: 'No valid members found' },
            { status: 404 }
          );
        }

        const pdfBytes = await cardGenerator.generateBatchCards(cardsData);

        return new NextResponse(pdfBytes as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="loyalty-cards-batch-${Date.now()}.pdf"`
          }
        });
      }

      // Generate all member cards
      case 'generate_all': {
        const members = await loyaltyService.getAllMembers();
        
        if (members.length === 0) {
          return NextResponse.json(
            { error: 'No members found' },
            { status: 404 }
          );
        }

        const cardsData: CardData[] = members.map(member => ({
          memberName: member.clientName,
          referralCode: member.referralCode,
          tier: member.tier,
          points: member.points,
          memberId: member.id
        }));

        const pdfBytes = await cardGenerator.generateBatchCards(cardsData);

        return new NextResponse(pdfBytes as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="all-loyalty-cards-${Date.now()}.pdf"`
          }
        });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            validActions: [
              'generate_loyalty_card',
              'generate_referral_card',
              'generate_batch',
              'generate_all'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Card generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate card', details: error.message },
      { status: 500 }
    );
  }
}
