import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
  try {
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
