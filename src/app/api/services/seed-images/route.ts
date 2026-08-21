import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const existingImages = [
  { name: 'POWDER.png', filePath: 'public/images/services/POWDER.png' },
  { name: 'STROKES.png', filePath: 'public/images/services/STROKES.png' },
  { name: 'COMBO.png', filePath: 'public/images/services/COMBO.png' },
  { name: 'OMBRE.png', filePath: 'public/images/services/OMBRE.png' },
  { name: 'BLADE+SHADE.png', filePath: 'public/images/services/BLADE+SHADE.png' },
  { name: 'BOLD-COMBO.png', filePath: 'public/images/services/BOLD-COMBO.png' },
  { name: 'APGM-icon.png', filePath: 'public/images/APGM-icon.png' }
];

export async function POST(request: NextRequest) {
  try {
    const results: Array<{ name: string; success: boolean; id?: string; error?: string; skipped?: boolean }> = [];

    for (const image of existingImages) {
      try {
        const fullPath = path.join(process.cwd(), image.filePath);

        if (!fs.existsSync(fullPath)) {
          results.push({ name: image.name, success: false, error: 'File not found', skipped: true });
          continue;
        }

        const buffer = fs.readFileSync(fullPath);
        const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

        const docRef = await db.collection('serviceImages').add({
          name: image.name,
          base64,
          mimeType: 'image/png',
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
