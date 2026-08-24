import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 85;

const existingImages = [
  // Service images
  { name: 'POWDER.png', filePath: 'public/images/services/POWDER.png' },
  { name: 'STROKES.png', filePath: 'public/images/services/STROKES.png' },
  { name: 'COMBO.png', filePath: 'public/images/services/COMBO.png' },
  { name: 'OMBRE.png', filePath: 'public/images/services/OMBRE.png' },
  { name: 'BLADE+SHADE.png', filePath: 'public/images/services/BLADE+SHADE.png' },
  { name: 'BOLD-COMBO.png', filePath: 'public/images/services/BOLD-COMBO.png' },
  { name: 'lipsBlush.png', filePath: 'public/images/services/lipsBlush.png' },
  { name: 'eyeliner_enhancement.png', filePath: 'public/images/services/eyeliner_enhancement.png' },
  // Home page images
  { name: 'APGM-icon.png', filePath: 'public/images/APGM-icon.png' },
  { name: 'victoria-escobar-hero-main.jpg', filePath: 'public/images/hero/victoria-escobar-hero-main.jpg' },
  { name: 'a-pretty-girl-matter-plaque.webp', filePath: 'public/images/a-pretty-girl-matter-plaque.webp' },
  { name: 'about-victoria.jpg', filePath: 'public/images/about/about-victoria.jpg' },
  { name: 'before-after.png', filePath: 'public/images/before-after.png' },
  { name: 'eyeliner_enhancement.webp', filePath: 'public/images/eyeliner_enhancement.webp' },
  { name: 'lipsBlush.webp', filePath: 'public/images/lipsBlush.webp' },
  // The Process images
  { name: 'BookNow.png', filePath: 'public/images/theprocess/BookNow.png' },
  { name: 'numbing.jpg', filePath: 'public/images/theprocess/numbing.jpg' },
  { name: 'shaping.jpg', filePath: 'public/images/theprocess/shaping.jpg' },
  { name: 'color.png', filePath: 'public/images/theprocess/color.png' },
  { name: 'touchup.png', filePath: 'public/images/theprocess/touchup.png' }
];

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

async function processImage(filePath: string): Promise<{ buffer: Buffer; mimeType: string; outputExt: string }> {
  const mimeType = getMimeType(filePath);
  const ext = path.extname(filePath).toLowerCase();

  let sharpInstance = sharp(filePath).resize(MAX_DIMENSION, MAX_DIMENSION, {
    fit: 'inside',
    withoutEnlargement: true
  });

  // For PNG/WebP with transparency, keep as is; for large JPEG/others, use high quality JPEG
  if (ext === '.png') {
    const buffer = await sharpInstance.png({ quality: 90, compressionLevel: 9 }).toBuffer();
    return { buffer, mimeType: 'image/png', outputExt: 'png' };
  } else if (ext === '.webp') {
    const buffer = await sharpInstance.webp({ quality: JPEG_QUALITY }).toBuffer();
    return { buffer, mimeType: 'image/webp', outputExt: 'webp' };
  } else {
    // Convert jpg/jpeg/gif/others to JPEG for size
    const buffer = await sharpInstance.jpeg({ quality: JPEG_QUALITY, progressive: true }).toBuffer();
    return { buffer, mimeType: 'image/jpeg', outputExt: 'jpg' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedNames = Array.isArray(body.names) ? body.names as string[] : [];
    const imagesToSeed = requestedNames.length > 0
      ? existingImages.filter(img => requestedNames.includes(img.name))
      : existingImages;

    const results: Array<{ name: string; success: boolean; id?: string; error?: string; skipped?: boolean }> = [];

    for (const image of imagesToSeed) {
      try {
        const fullPath = path.join(process.cwd(), image.filePath);

        if (!fs.existsSync(fullPath)) {
          results.push({ name: image.name, success: false, error: 'File not found', skipped: true });
          continue;
        }

        // Skip if already seeded by name
        const existing = await db.collection('serviceImages').where('name', '==', image.name).limit(1).get();
        if (!existing.empty) {
          results.push({ name: image.name, success: false, skipped: true, error: 'Already seeded' });
          continue;
        }

        const { buffer, mimeType } = await processImage(fullPath);
        const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;

        const docRef = await db.collection('serviceImages').add({
          name: image.name,
          base64,
          mimeType,
          size: buffer.length,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        results.push({ name: image.name, success: true, id: docRef.id });
        console.log(`✅ Seeded image: ${image.name} (${docRef.id})`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({ name: image.name, success: false, error: errorMsg });
        console.error(`❌ Failed to seed image: ${image.name}`, error);
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;

    return NextResponse.json({
      success: failed === 0,
      message: `Seeded ${succeeded} images, ${failed} failed, ${skipped} skipped`,
      results
    }, { status: failed === 0 ? 200 : 500 });
  } catch (error) {
    console.error('Seed images error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
