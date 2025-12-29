import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

// POST - Add Victoria as Artist and Admin
export async function POST(request: NextRequest) {
  try {
    const victoriaEmail = 'victoria@aprettygirlmatter.com';
    
    // Check if Victoria already exists
    const usersRef = collection(getDb(), 'users');
    const q = query(usersRef, where('email', '==', victoriaEmail));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Victoria exists - update her role to admin (admins can also be artists in the system)
      const existingDoc = snapshot.docs[0];
      await updateDoc(doc(getDb(), 'users', existingDoc.id), {
        role: 'admin',
        isArtist: true, // Custom flag to indicate she's also an artist
        displayName: 'Victoria',
        specialties: ['Permanent Makeup', 'Microblading', 'Lip Blush', 'Eyeliner'],
        isActive: true,
        updatedAt: new Date()
      });
      
      return NextResponse.json({
        success: true,
        message: 'Victoria updated to Admin with Artist privileges',
        userId: existingDoc.id
      });
    } else {
      // Create new user for Victoria
      const newUserRef = doc(collection(getDb(), 'users'));
      await setDoc(newUserRef, {
        email: victoriaEmail,
        displayName: 'Victoria',
        role: 'admin',
        isArtist: true, // Custom flag to indicate she's also an artist
        phone: '',
        specialties: ['Permanent Makeup', 'Microblading', 'Lip Blush', 'Eyeliner'],
        bio: 'Owner and Lead Artist at A Pretty Girl Matter',
        isActive: true,
        createdAt: new Date()
      });
      
      return NextResponse.json({
        success: true,
        message: 'Victoria created as Admin with Artist privileges',
        userId: newUserRef.id
      });
    }
  } catch (error) {
    console.error('Error adding Victoria:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add Victoria' },
      { status: 500 }
    );
  }
}

// GET - Check Victoria's status
export async function GET() {
  try {
    const victoriaEmail = 'victoria@aprettygirlmatter.com';
    
    const usersRef = collection(getDb(), 'users');
    const q = query(usersRef, where('email', '==', victoriaEmail));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return NextResponse.json({
        exists: true,
        userId: snapshot.docs[0].id,
        role: data.role,
        isArtist: data.isArtist || false,
        displayName: data.displayName
      });
    }
    
    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Error checking Victoria:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check' },
      { status: 500 }
    );
  }
}
