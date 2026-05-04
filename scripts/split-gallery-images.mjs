/**
 * split-gallery-images.mjs
 *
 * Reads every JPEG from public/images/gallery,
 * splits each composite image in half (left = BEFORE, right = AFTER),
 * adds a black padding strip at the bottom with a white label,
 * and writes the two files to public/images/edited/
 *
 * Run from the permanent-makeup-website folder:
 *   node scripts/split-gallery-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT_DIR  = path.join(__dirname, '..', 'public', 'images', 'gallery');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'edited');

const LABEL_HEIGHT = 52;       // px of black strip at the bottom for the text
const FONT_SIZE    = 22;       // px — SVG font-size
const LETTER_SPACING = 6;      // px

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const files = fs.readdirSync(INPUT_DIR).filter(f =>
  /\.(jpe?g|png)$/i.test(f)
);

console.log(`Found ${files.length} images in ${INPUT_DIR}`);

for (const file of files) {
  const inputPath = path.join(INPUT_DIR, file);
  const base = path.parse(file).name;

  try {
    const img = sharp(inputPath);
    const { width, height } = await img.metadata();

    const halfW = Math.floor(width / 2);

    // Detect and trim the original branding strip at the bottom.
    // The original images have a "BEFORE / AFTER" label bar at the bottom ~13% of height.
    // We crop it out so our clean label replaces it.
    const cropHeight = Math.floor(height * 0.84); // keep top 84% of photo

    for (const side of ['before', 'after']) {
      const label      = side === 'before' ? 'BEFORE' : 'AFTER';
      const left       = side === 'before' ? 0 : halfW;
      const outputPath = path.join(OUTPUT_DIR, `${base}_${side}.jpg`);

      // Total height of output = cropped photo height + label strip
      const totalHeight = cropHeight + LABEL_HEIGHT;

      // SVG label overlay (centered in the black strip)
      const labelSvg = `
        <svg width="${halfW}" height="${LABEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${halfW}" height="${LABEL_HEIGHT}" fill="black"/>
          <text
            x="${halfW / 2}"
            y="${LABEL_HEIGHT / 2 + FONT_SIZE / 3}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${FONT_SIZE}"
            font-weight="bold"
            letter-spacing="${LETTER_SPACING}"
            fill="white"
            text-anchor="middle"
            dominant-baseline="middle"
          >${label}</text>
        </svg>`;

      const labelBuffer = Buffer.from(labelSvg);

      await sharp({
        create: {
          width:      halfW,
          height:     totalHeight,
          channels:   3,
          background: { r: 0, g: 0, b: 0 },
        },
      })
        .composite([
          // Cropped half of the original image at the top
          {
            input: await sharp(inputPath)
              .extract({ left, top: 0, width: halfW, height: cropHeight })
              .toBuffer(),
            top:  0,
            left: 0,
          },
          // Label strip at the bottom
          {
            input: labelBuffer,
            top:   cropHeight,
            left:  0,
          },
        ])
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      console.log(`  ✓  ${path.basename(outputPath)}`);
    }
  } catch (err) {
    console.error(`  ✗  ${file}:`, err.message);
  }
}

console.log(`\nDone! Edited images saved to: ${OUTPUT_DIR}`);
