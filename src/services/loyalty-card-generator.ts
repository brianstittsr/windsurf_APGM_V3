/**
 * Loyalty Card PDF Generator
 * Creates printable referral and loyalty cards with QR codes
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

// ============================================================================
// Types
// ============================================================================

export interface CardData {
  memberName: string;
  referralCode: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  memberId: string;
  qrCodeUrl?: string;
}

export interface CardStyle {
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  accentColor: [number, number, number];
}

// ============================================================================
// Constants
// ============================================================================

const CARD_WIDTH = 252; // 3.5 inches at 72 DPI
const CARD_HEIGHT = 144; // 2 inches at 72 DPI
const CARDS_PER_PAGE = 10; // 2 columns x 5 rows
const PAGE_MARGIN = 36;
const CARD_MARGIN = 9;

const TIER_COLORS: Record<string, CardStyle> = {
  bronze: {
    primaryColor: [0.8, 0.5, 0.2],
    secondaryColor: [0.6, 0.4, 0.2],
    accentColor: [1, 0.95, 0.9]
  },
  silver: {
    primaryColor: [0.75, 0.75, 0.75],
    secondaryColor: [0.5, 0.5, 0.5],
    accentColor: [0.95, 0.95, 0.95]
  },
  gold: {
    primaryColor: [1, 0.84, 0],
    secondaryColor: [0.85, 0.65, 0.13],
    accentColor: [1, 0.98, 0.9]
  },
  platinum: {
    primaryColor: [0.9, 0.89, 0.88],
    secondaryColor: [0.6, 0.6, 0.65],
    accentColor: [0.98, 0.98, 0.98]
  }
};

// ============================================================================
// Loyalty Card Generator
// ============================================================================

export class LoyaltyCardGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://atlantaglamourpmu.com') {
    this.baseUrl = baseUrl;
  }

  // --------------------------------------------------------------------------
  // Generate Single Card PDF
  // --------------------------------------------------------------------------

  async generateSingleCard(cardData: CardData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([CARD_WIDTH + 20, CARD_HEIGHT + 20]);
    
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Generate QR code
    const qrDataUrl = await this.generateQRDataUrl(cardData.referralCode);
    const qrImageBytes = await this.dataUrlToBytes(qrDataUrl);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    await this.drawCard(page, cardData, 10, 10, font, fontRegular, qrImage);

    return pdfDoc.save();
  }

  // --------------------------------------------------------------------------
  // Generate Batch Cards PDF (Multiple cards per page)
  // --------------------------------------------------------------------------

  async generateBatchCards(cardsData: CardData[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Pre-generate all QR codes
    const qrImages: any[] = [];
    for (const card of cardsData) {
      const qrDataUrl = await this.generateQRDataUrl(card.referralCode);
      const qrImageBytes = await this.dataUrlToBytes(qrDataUrl);
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      qrImages.push(qrImage);
    }

    // Calculate page dimensions (Letter size)
    const pageWidth = 612;
    const pageHeight = 792;
    const cardsPerRow = 2;
    const cardsPerColumn = 5;

    let cardIndex = 0;
    
    while (cardIndex < cardsData.length) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      for (let row = 0; row < cardsPerColumn && cardIndex < cardsData.length; row++) {
        for (let col = 0; col < cardsPerRow && cardIndex < cardsData.length; col++) {
          const x = PAGE_MARGIN + col * (CARD_WIDTH + CARD_MARGIN);
          const y = pageHeight - PAGE_MARGIN - (row + 1) * (CARD_HEIGHT + CARD_MARGIN);

          await this.drawCard(
            page,
            cardsData[cardIndex],
            x,
            y,
            font,
            fontRegular,
            qrImages[cardIndex]
          );

          cardIndex++;
        }
      }
    }

    return pdfDoc.save();
  }

  // --------------------------------------------------------------------------
  // Generate Referral Card PDF
  // --------------------------------------------------------------------------

  async generateReferralCard(cardData: CardData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([CARD_WIDTH + 20, CARD_HEIGHT + 20]);
    
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const qrDataUrl = await this.generateQRDataUrl(cardData.referralCode);
    const qrImageBytes = await this.dataUrlToBytes(qrDataUrl);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    await this.drawReferralCard(page, cardData, 10, 10, font, fontRegular, qrImage);

    return pdfDoc.save();
  }

  // --------------------------------------------------------------------------
  // Draw Card
  // --------------------------------------------------------------------------

  private async drawCard(
    page: any,
    cardData: CardData,
    x: number,
    y: number,
    fontBold: any,
    fontRegular: any,
    qrImage: any
  ): Promise<void> {
    const style = TIER_COLORS[cardData.tier] || TIER_COLORS.bronze;

    // Card background
    page.drawRectangle({
      x,
      y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      color: rgb(...style.accentColor),
      borderColor: rgb(...style.primaryColor),
      borderWidth: 2
    });

    // Header bar
    page.drawRectangle({
      x,
      y: y + CARD_HEIGHT - 35,
      width: CARD_WIDTH,
      height: 35,
      color: rgb(...style.primaryColor)
    });

    // Business name
    page.drawText('ATLANTA GLAMOUR PMU', {
      x: x + 10,
      y: y + CARD_HEIGHT - 25,
      size: 12,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Tier badge
    page.drawText(cardData.tier.toUpperCase(), {
      x: x + CARD_WIDTH - 60,
      y: y + CARD_HEIGHT - 25,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Member name
    page.drawText(cardData.memberName, {
      x: x + 10,
      y: y + CARD_HEIGHT - 55,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2)
    });

    // Points
    page.drawText(`${cardData.points.toLocaleString()} Points`, {
      x: x + 10,
      y: y + CARD_HEIGHT - 70,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4)
    });

    // Referral code label
    page.drawText('REFERRAL CODE', {
      x: x + 10,
      y: y + 35,
      size: 7,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Referral code
    page.drawText(cardData.referralCode, {
      x: x + 10,
      y: y + 15,
      size: 14,
      font: fontBold,
      color: rgb(...style.secondaryColor)
    });

    // QR Code
    const qrSize = 70;
    page.drawImage(qrImage, {
      x: x + CARD_WIDTH - qrSize - 10,
      y: y + 10,
      width: qrSize,
      height: qrSize
    });

    // Scan text
    page.drawText('Scan to refer', {
      x: x + CARD_WIDTH - qrSize - 5,
      y: y + 5,
      size: 6,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  // --------------------------------------------------------------------------
  // Draw Referral Card (Simpler design for giving to friends)
  // --------------------------------------------------------------------------

  private async drawReferralCard(
    page: any,
    cardData: CardData,
    x: number,
    y: number,
    fontBold: any,
    fontRegular: any,
    qrImage: any
  ): Promise<void> {
    // Purple gradient background
    page.drawRectangle({
      x,
      y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      color: rgb(0.545, 0.361, 0.965) // Purple
    });

    // White content area
    page.drawRectangle({
      x: x + 5,
      y: y + 5,
      width: CARD_WIDTH - 10,
      height: CARD_HEIGHT - 40,
      color: rgb(1, 1, 1)
    });

    // Business name in header
    page.drawText('ATLANTA GLAMOUR PMU', {
      x: x + 10,
      y: y + CARD_HEIGHT - 25,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Referral message
    page.drawText('You\'ve been referred!', {
      x: x + 15,
      y: y + CARD_HEIGHT - 55,
      size: 10,
      font: fontBold,
      color: rgb(0.545, 0.361, 0.965)
    });

    // Discount offer
    page.drawText('Get $50 OFF', {
      x: x + 15,
      y: y + CARD_HEIGHT - 75,
      size: 14,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2)
    });

    page.drawText('your first PMU service!', {
      x: x + 15,
      y: y + CARD_HEIGHT - 90,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4)
    });

    // Code label
    page.drawText('Use code:', {
      x: x + 15,
      y: y + 25,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Referral code
    page.drawText(cardData.referralCode, {
      x: x + 15,
      y: y + 10,
      size: 12,
      font: fontBold,
      color: rgb(0.545, 0.361, 0.965)
    });

    // QR Code
    const qrSize = 60;
    page.drawImage(qrImage, {
      x: x + CARD_WIDTH - qrSize - 15,
      y: y + 15,
      width: qrSize,
      height: qrSize
    });

    // From label
    page.drawText(`From: ${cardData.memberName}`, {
      x: x + CARD_WIDTH - qrSize - 15,
      y: y + 10,
      size: 6,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private async generateQRDataUrl(referralCode: string): Promise<string> {
    const referralUrl = `${this.baseUrl}/refer/${referralCode}`;
    return QRCode.toDataURL(referralUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#8B5CF6',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
  }

  private async dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createCardGenerator(baseUrl?: string): LoyaltyCardGenerator {
  return new LoyaltyCardGenerator(baseUrl);
}
