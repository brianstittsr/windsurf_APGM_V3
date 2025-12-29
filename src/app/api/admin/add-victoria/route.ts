import { NextRequest, NextResponse } from 'next/server';

// POST - Add Victoria as Artist and Admin
export async function POST(request: NextRequest) {
  try {
    const victoriaEmail = 'victoria@aprettygirlmatter.com';
    
    // Use dynamic import for firebase
    const { collection, getDocs, query, where, doc, updateDoc } = await import('firebase/firestore');
    const { getDb } = await import('@/lib/firebase');
    
    // Search by email in root field
    let usersRef = collection(getDb(), 'users');
    let q = query(usersRef, where('email', '==', victoriaEmail));
    let snapshot = await getDocs(q);
    
    // If not found, try profile.email
    if (snapshot.empty) {
      q = query(usersRef, where('profile.email', '==', victoriaEmail));
      snapshot = await getDocs(q);
    }
    
    if (!snapshot.empty) {
      // Victoria exists - update her to add artist privileges
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();
      
      await updateDoc(doc(getDb(), 'users', existingDoc.id), {
        role: 'admin', // Ensure admin role
        isArtist: true, // Add artist flag
        specialties: ['Permanent Makeup', 'Microblading', 'Lip Blush', 'Eyeliner'],
        bio: existingData.bio || 'Owner and Lead Artist at A Pretty Girl Matter',
        isActive: true,
        updatedAt: new Date()
      });
      
      return NextResponse.json({
        success: true,
        message: 'Victoria updated - now Admin with Artist privileges (single login)',
        userId: existingDoc.id,
        email: victoriaEmail
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Victoria user not found. Please ensure she has logged in at least once.',
        searchedEmail: victoriaEmail
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating Victoria:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update Victoria' },
      { status: 500 }
    );
  }
}

// GET - Check Victoria's status
export async function GET() {
  try {
    const victoriaEmail = 'victoria@aprettygirlmatter.com';
    
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const { getDb } = await import('@/lib/firebase');
    
    // Search by email in root field
    let usersRef = collection(getDb(), 'users');
    let q = query(usersRef, where('email', '==', victoriaEmail));
    let snapshot = await getDocs(q);
    
    // If not found, try profile.email
    if (snapshot.empty) {
      q = query(usersRef, where('profile.email', '==', victoriaEmail));
      snapshot = await getDocs(q);
    }
    
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return NextResponse.json({
        exists: true,
        userId: snapshot.docs[0].id,
        email: data.email || data.profile?.email,
        role: data.role,
        isArtist: data.isArtist || false,
        displayName: data.displayName || data.profile?.firstName,
        specialties: data.specialties || []
      });
    }
    
    return NextResponse.json({ 
      exists: false,
      searchedEmail: victoriaEmail,
      message: 'User not found. Make sure Victoria has logged in at least once.'
    });
  } catch (error) {
    console.error('Error checking Victoria:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check' },
      { status: 500 }
    );
  }
}
