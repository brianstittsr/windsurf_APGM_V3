import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Target size for base64 storage (under 1MB to fit in Firestore)
const TARGET_SIZE = 800 * 1024; // 800KB target (leaves room for other document fields)
const MAX_ORIGINAL_SIZE = 20 * 1024 * 1024; // Accept files up to 20MB for compression

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'hero';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type - only images for base64 storage
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Validate original file size (max 20MB - we'll compress it)
    if (file.size > MAX_ORIGINAL_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 20MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(new Uint8Array(bytes));
    let outputType = file.type;
    let wasCompressed = false;

    // If file is larger than target, compress it
    if (file.size > TARGET_SIZE) {
      console.log(`Compressing image from ${(file.size / 1024).toFixed(0)}KB...`);
      
      try {
        // Get image metadata
        const metadata = await sharp(buffer).metadata();
        const { width = 1920, height = 1080 } = metadata;
        
        // Calculate new dimensions (max 1920px wide, maintain aspect ratio)
        let newWidth = width;
        let newHeight = height;
        const maxDimension = 1920;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            newWidth = maxDimension;
            newHeight = Math.round((height / width) * maxDimension);
          } else {
            newHeight = maxDimension;
            newWidth = Math.round((width / height) * maxDimension);
          }
        }

        // Start with quality 85 and reduce if needed
        let quality = 85;
        let compressedBuffer: Buffer;
        
        do {
          compressedBuffer = await sharp(buffer)
            .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();
          
          console.log(`Quality ${quality}: ${(compressedBuffer.length / 1024).toFixed(0)}KB`);
          
          if (compressedBuffer.length <= TARGET_SIZE) {
            break;
          }
          
          quality -= 10;
        } while (quality >= 30);

        // If still too large, reduce dimensions further
        if (compressedBuffer.length > TARGET_SIZE) {
          const scaleFactor = Math.sqrt(TARGET_SIZE / compressedBuffer.length);
          newWidth = Math.round(newWidth * scaleFactor);
          newHeight = Math.round(newHeight * scaleFactor);
          
          compressedBuffer = await sharp(buffer)
            .resize(newWidth, newHeight, { fit: 'inside' })
            .jpeg({ quality: 70, mozjpeg: true })
            .toBuffer();
          
          console.log(`Resized to ${newWidth}x${newHeight}: ${(compressedBuffer.length / 1024).toFixed(0)}KB`);
        }

        buffer = Buffer.from(compressedBuffer);
        outputType = 'image/jpeg';
        wasCompressed = true;
        
        console.log(`Compression complete: ${(file.size / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB`);
      } catch (compressError) {
        console.error('Compression failed, using original:', compressError);
        // If compression fails, check if original is small enough
        if (file.size > TARGET_SIZE * 1.5) {
          return NextResponse.json(
            { error: 'Image compression failed. Please try a smaller image.' },
            { status: 400 }
          );
        }
      }
    }

    // Convert to base64
    const base64 = buffer.toString('base64');
    
    // Create data URL (can be used directly in img src)
    const dataUrl = `data:${outputType};base64,${base64}`;

    // Create unique filename for reference
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName,
      folder,
      originalSize: file.size,
      compressedSize: buffer.length,
      type: outputType,
      isBase64: true,
      wasCompressed
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    );
  }
}
