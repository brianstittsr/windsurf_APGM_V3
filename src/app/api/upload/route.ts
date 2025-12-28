import { NextRequest, NextResponse } from 'next/server';

// Lazy load Firebase Admin to prevent build issues
async function getFirebaseStorage() {
  try {
    const { storage } = await import('@/lib/firebase-admin');
    return storage;
  } catch (error) {
    console.error('Firebase Storage not available:', error);
    return null;
  }
}

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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, MP4, WebM' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Get Firebase Storage
    const storage = await getFirebaseStorage();
    if (!storage) {
      return NextResponse.json(
        { error: 'Storage service not available' },
        { status: 500 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;
    
    // Determine storage path based on file type
    const isVideo = file.type.startsWith('video/');
    const storagePath = isVideo 
      ? `videos/${folder}/${fileName}`
      : `images/${folder}/${fileName}`;

    // Get the default bucket
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make the file publicly accessible
    await fileRef.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      storagePath,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
