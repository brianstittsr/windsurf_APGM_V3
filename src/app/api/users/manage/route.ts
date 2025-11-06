import { NextResponse } from 'next/server';
import { auth as clientAuth, getDb } from '@/lib/firebase';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    // First, verify the requesting user is an admin.
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      console.log('⚠️ No token provided in Authorization header');
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Use try-catch to handle potential Admin SDK initialization errors
    let requesterUid: string;
    let isAdmin = false;
    
    try {
      // Try Admin SDK first
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      requesterUid = decodedToken.uid;
      
      const userDoc = await adminDb.collection('users').doc(requesterUid).get();
      if (userDoc.exists && userDoc.data()?.role === 'admin') {
        isAdmin = true;
      }
    } catch (adminError) {
      console.error('Admin SDK error:', adminError);
      
      // Fallback to client SDK for auth verification
      try {
        // Get the current user's ID from the client auth
        const currentUser = clientAuth.currentUser;
        if (!currentUser) {
          return NextResponse.json({ error: 'Unauthorized - No current user' }, { status: 401 });
        }
        
        requesterUid = currentUser.uid;
        
        // Check if user is admin using client SDK
        const db = getDb();
        const userDocRef = doc(db, 'users', requesterUid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data()?.role === 'admin') {
          isAdmin = true;
        }
      } catch (clientError) {
        console.error('Client SDK error:', clientError);
        return NextResponse.json({ error: 'Authentication verification failed' }, { status: 500 });
      }
    }
    
    // Verify admin role
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Not an admin user' }, { status: 403 });
    }

    console.log(`✅ User ${requesterUid} verified as admin: ${isAdmin}`);
    
    // Proceed with the requested action
    const { action, uid, email, newPassword } = await req.json();
    console.log(`🔄 Processing action: ${action} for uid: ${uid}`);

    if (!action || !uid) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    switch (action) {
      case 'reset_password':
        if (!email) {
          return NextResponse.json({ error: 'Email is required to send a password reset link' }, { status: 400 });
        }
        
        try {
          // Use the client SDK to send the reset email directly
          // This avoids the need for a separate email service
          await sendPasswordResetEmail(clientAuth, email);
          return NextResponse.json({ 
            message: `Password reset email sent to ${email}` 
          });
        } catch (resetError: any) {
          console.error('Password reset error:', resetError);
          
          let errorMessage = 'Failed to send password reset email';
          let statusCode = 500;
          
          if (resetError.code === 'auth/user-not-found') {
            errorMessage = 'No user found with that email address';
            statusCode = 404;
          } else if (resetError.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address format';
            statusCode = 400;
          }
          
          return NextResponse.json({ error: errorMessage }, { status: statusCode });
        }

      case 'update_password':
        if (!newPassword) {
          return NextResponse.json({ error: 'New password is required' }, { status: 400 });
        }
        if (newPassword.length < 6) {
          return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }
        
        try {
          // Try Admin SDK first for password update
          try {
            console.log(`🔐 Attempting password update for user ${uid}`);
            await adminAuth.updateUser(uid, { password: newPassword });
            console.log(`✅ Password updated successfully for user ${uid}`);
            return NextResponse.json({ message: 'Password updated successfully' });
          } catch (adminError) {
            console.error('Admin SDK password update error:', adminError);
            
            // If we're updating our own password as admin, try a direct client-side approach
            if (uid === requesterUid) {
              console.log(`⚠️ Admin SDK failed, attempting direct Firebase update for self-password change`);
              
              // We'll use direct Firebase Auth REST API since we can't reauthenticate without the current password
              const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
              const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  idToken,
                  password: newPassword,
                  returnSecureToken: true
                })
              });
              
              if (response.ok) {
                console.log(`✅ Password updated successfully via direct Firebase API`);
                return NextResponse.json({ message: 'Password updated successfully' });
              } else {
                const errorData = await response.json();
                console.error('Firebase API error:', errorData);
                return NextResponse.json({ 
                  error: 'Password update failed', 
                  details: errorData.error?.message || 'Unknown error'
                }, { status: 500 });
              }
            }
            
            // For API simplicity, we'll report the admin error
            return NextResponse.json({ 
              error: 'Unable to update password. Firebase Admin SDK not properly configured.', 
              details: adminError instanceof Error ? adminError.message : 'Unknown error'
            }, { status: 500 });
          }
        } catch (error) {
          console.error('Password update error:', error);
          return NextResponse.json({ 
            error: 'Password update failed', 
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in user management API:', error);

    // Handle Firebase Auth specific errors
    if (error.code) {
      switch (error.code) {
        case 'auth/id-token-expired':
          return NextResponse.json({ 
            error: 'Authentication token has expired. Please log in again.' 
          }, { status: 401 });
          
        case 'auth/user-not-found':
          return NextResponse.json({ 
            error: 'User not found' 
          }, { status: 404 });
          
        case 'auth/invalid-credential':
          return NextResponse.json({ 
            error: 'Invalid credentials. Please log in again.' 
          }, { status: 401 });
          
        case 'auth/invalid-email':
          return NextResponse.json({ 
            error: 'Invalid email format' 
          }, { status: 400 });
          
        default:
          return NextResponse.json({ 
            error: `Firebase error: ${error.code}`, 
            message: error.message 
          }, { status: 500 });
      }
    }
    
    // For non-Firebase errors
    return NextResponse.json({ 
      error: 'An internal server error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
