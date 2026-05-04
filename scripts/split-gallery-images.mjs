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

const LABEL_HEIGHT   = 52;  // px black strip at the bottom for the text
const FONT_SIZE      = 22;  // px — SVG font-size
const LETTER_SPACING = 6;   // px

/**
 * Per-image crop overrides.
 * topFrac    : fraction of image height to skip from the top    (default 0)
 * bottomFrac : fraction of image height to keep from the top    (default 0.84)
 *
 * Observations from visual inspection:
 *  - 0C33214B  : dark BG, small logo bottom-right corner — crop 84% is fine
 *  - 18FFAF18  : white branded footer ~40% of height, BEFORE/AFTER labels embedded
 *  - 27256B3F  : clean white BG, no logo — keep full photo
 *  - 29F668EA  : clean white BG, no logo — keep full photo
 *  - 6E06ACA2  : pink BG, logo+title at top ~18%, BEFORE/AFTER bar at bottom ~10%
 *  - 7151A3CA  : clean gray BG, no logo — keep full photo
 *  - A5BF43BF  : black BG, logo center-top ~18%, BEFORE/AFTER bar at bottom ~10%
 *  - AEB29E0F  : pink BG, tiny logo top ~10%, labels tiny at bottom ~5%
 *  - D06690BA  : black BG, logo center-top ~18%, BEFORE/AFTER bar at bottom ~10%
 */
const CROP_OVERRIDES = {
  '18FFAF18-637B-41C5-B7DF-B32CA59E9A7F_1_105_c': { topFrac: 0.00, bottomFrac: 0.60 },
  '6E06ACA2-DFC1-4B18-8086-064A35366BFD_1_102_o': { topFrac: 0.19, bottomFrac: 0.90 },
  'A5BF43BF-8A9F-4C3A-9E03-C938A9E0E67F_1_102_o': { topFrac: 0.24, bottomFrac: 0.90 },
  'AEB29E0F-C582-4264-9FF6-FE2C4CEAEA85_4_5005_c': { topFrac: 0.10, bottomFrac: 0.94 },
  'D06690BA-A746-4AFA-AFBF-8B76BE6A777F_1_102_o': { topFrac: 0.24, bottomFrac: 0.90 },
  // Clean images — full photo, no branded strip
  '27256B3F-0857-4070-AD73-939BAD8F609F_1_105_c': { topFrac: 0.00, bottomFrac: 1.00 },
  '29F668EA-399A-4A32-B81D-620E9EA4788F_1_105_c': { topFrac: 0.00, bottomFrac: 1.00 },
  '7151A3CA-9B4E-43C4-B1B6-F84ADAE6296D_1_102_o': { topFrac: 0.00, bottomFrac: 1.00 },
};
const DEFAULT_CROP = { topFrac: 0.00, bottomFrac: 0.84 };

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

    const { topFrac, bottomFrac } = CROP_OVERRIDES[base] ?? DEFAULT_CROP;
    const topPx    = Math.floor(height * topFrac);
    const cropHeight = Math.floor(height * bottomFrac) - topPx;

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
              .extract({ left, top: topPx, width: halfW, height: cropHeight })
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
