import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

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

    // Generate unique filename
    const fileName = `tryon-photos/${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, fileName);

    // Upload to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
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
