/**
 * Client-side image conversion utilities
 * Converts images to WebP format using Canvas API
 */

export interface ConversionOptions {
  quality?: number; // 0-1, default 0.85
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Convert a File to WebP Blob
 * Uses Canvas API for client-side conversion
 */
export async function convertToWebP(
  file: File,
  options: ConversionOptions = {}
): Promise<{ blob: Blob; fileName: string; originalSize: number; convertedSize: number }> {
  const { quality = 0.85, maxWidth = 1920, maxHeight = 1920 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Use better quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }

          // Generate WebP filename
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const webpFileName = `${baseName}.webp`;

          resolve({
            blob,
            fileName: webpFileName,
            originalSize: file.size,
            convertedSize: blob.size,
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Convert a File to WebP File object
 * Useful for form uploads that expect File objects
 */
export async function convertFileToWebP(
  file: File,
  options: ConversionOptions = {}
): Promise<File> {
  const { blob, fileName } = await convertToWebP(file, options);
  return new File([blob], fileName, { type: 'image/webp' });
}

/**
 * Check if browser supports WebP encoding
 */
export function supportsWebPEncoding(): boolean {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Check if file is already WebP
 */
export function isWebP(file: File): boolean {
  return file.type === 'image/webp' || getFileExtension(file.name) === 'webp';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Calculate compression savings percentage
 */
export function calculateSavings(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
