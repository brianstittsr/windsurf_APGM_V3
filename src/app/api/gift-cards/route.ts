import { NextRequest, NextResponse } from 'next/server';
import { GiftCardService } from '@/services/giftCardService';

export async function POST(request: NextRequest) {
  try {
    const giftCardData = await request.json();

    // Validate required fields
    if (!giftCardData.initialAmount || !giftCardData.recipientEmail || !giftCardData.recipientName || !giftCardData.expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields: initialAmount, recipientEmail, recipientName, expiresAt' },
        { status: 400 }
      );
    }

    // Create the gift card
    const giftCardId = await GiftCardService.createGiftCard(giftCardData);

    return NextResponse.json({
      success: true,
      giftCardId,
      message: 'Gift card created successfully'
    });
  } catch (error) {
    console.error('Error creating gift card:', error);
    return NextResponse.json(
      { error: 'Failed to create gift card' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const giftCards = await GiftCardService.getAllGiftCards();
    return NextResponse.json({
      success: true,
      giftCards
    });
  } catch (error) {
    console.error('Error fetching gift cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gift cards' },
      { status: 500 }
    );
  }
}
