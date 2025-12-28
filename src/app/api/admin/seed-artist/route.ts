import { NextResponse } from 'next/server';

// Lazy load Firebase Admin to prevent Turbopack symlink errors on Windows
async function getFirebaseDb() {
  try {
    const { db } = await import('@/lib/firebase-admin');
    return db;
  } catch (error) {
    console.warn('Firebase Admin not available:', error);
    return null;
  }
}

async function getFieldValue() {
  try {
    const { FieldValue } = await import('firebase-admin/firestore');
    return FieldValue;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const db = await getFirebaseDb();
    const FieldValue = await getFieldValue();
    
    if (!db || !FieldValue) {
      return NextResponse.json({ error: 'Firebase not available' }, { status: 503 });
    }
    
    const artistData = {
      displayName: 'Victoria Escobar',
      email: 'victoria@aprettygirlmatter.com',
      role: 'artist',
      isActive: true,
      specialties: ['Microblading', 'Lip Blushing', 'Eyeliner'],
      bio: 'Owner and lead artist at A Pretty Girl Matter, specializing in permanent makeup artistry.',
      phone: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      profile: {
        firstName: 'Victoria',
        lastName: 'Escobar',
        email: 'victoria@aprettygirlmatter.com'
      }
    };
    
    // Use a consistent ID for Victoria as artist
    await db.collection('users').doc('victoria_escobar_artist').set(artistData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Victoria Escobar added as an artist successfully!' 
    });
    
  } catch (error: any) {
    console.error('Error adding artist:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
