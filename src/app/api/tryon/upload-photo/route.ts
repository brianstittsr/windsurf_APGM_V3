import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const clientId = formData.get('clientId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert image to WebP for better compression
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(bytes));

    // Convert to WebP with quality 85 for optimal size/quality balance
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85, effort: 6 })
      .toBuffer();

    console.log(`Converted ${file.name} to WebP: ${(file.size / 1024).toFixed(0)}KB -> ${(webpBuffer.length / 1024).toFixed(0)}KB`);

    // Generate unique filename with .webp extension
    const baseFileName = file.name.replace(/\.[^/.]+$/, ''); // Remove original extension
    const fileName = `tryon-photos/${uuidv4()}-${baseFileName}.webp`;
    const storageRef = ref(storage, fileName);

    // Upload WebP image to Firebase Storage with proper content type
    const snapshot = await uploadBytes(storageRef, webpBuffer, {
      contentType: 'image/webp'
    });
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Basic face detection validation (simulated)
    // In production, this would use actual face detection APIs
    const faceDetectionResult = {
      hasFace: true, // Simulated face detection
      faceQuality: 'good',
      landmarks: {
        leftEyebrow: { start: [100, 150], peak: [150, 140], end: [200, 150] },
        rightEyebrow: { start: [300, 150], peak: [350, 140], end: [400, 150] },
        eyeCorners: { left: [120, 160], right: [380, 160] }
      },
      confidence: 0.95
    };

    return NextResponse.json({
      success: true,
      imageUrl: downloadURL,
      fileName: fileName,
      faceDetection: faceDetectionResult,
      clientId: clientId || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process photo upload' },
      { status: 500 }
    );
  }
}
