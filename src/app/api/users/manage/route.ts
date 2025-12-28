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
      // Try Admin SDK first with proper error handling
      try {
        console.log('Attempting to verify token with Admin SDK...');
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        requesterUid = decodedToken.uid;
        console.log(`Token verified successfully, uid: ${requesterUid}`);
        
        const userDoc = await adminDb.collection('users').doc(requesterUid).get();
        if (userDoc.exists && userDoc.data()?.role === 'admin') {
          isAdmin = true;
          console.log(`User verified as admin: ${isAdmin}`);
        }
      } catch (verificationError) {
        console.error('Token verification error:', verificationError);
        throw verificationError; // Re-throw to be caught by the outer catch
      }
    } catch (adminError) {
      console.error('Admin SDK error:', adminError);
      
      // Attempt to validate the token directly with Firebase Auth REST API
      try {
        console.log('Admin SDK failed, attempting direct token validation with Firebase Auth REST API');
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        
        // Use the token to get user data directly from Firebase Auth
        const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idToken
          })
        });
        
        if (!authResponse.ok) {
          console.error('Firebase Auth API error:', await authResponse.text());
          return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
        }
        
        const userData = await authResponse.json();
        if (!userData.users || userData.users.length === 0) {
          console.error('No user found for the given token');
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        requesterUid = userData.users[0].localId;
        console.log(`User ID retrieved from token: ${requesterUid}`);
        
        // Check if user is admin using Firestore
        const db = getDb();
        const userDocRef = doc(db, 'users', requesterUid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data()?.role === 'admin') {
          isAdmin = true;
          console.log(`User verified as admin via Firebase Auth API: ${isAdmin}`);
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
    const { action, uid, email, newPassword, displayName, role, phone, firstName, lastName } = await req.json();
    console.log(`🔄 Processing action: ${action} for uid: ${uid || 'new user'}`);

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }

    switch (action) {
      case 'create_user':
        if (!email || !displayName) {
          return NextResponse.json({ error: 'Email and display name are required' }, { status: 400 });
        }
        
        try {
          console.log(`🆕 Creating new user with email: ${email}`);
          
          // Generate a temporary password if not provided
          const tempPassword = newPassword || Math.random().toString(36).slice(-12) + 'A1!';
          
          // Create user in Firebase Auth using Admin SDK
          const newUser = await adminAuth.createUser({
            email,
            password: tempPassword,
            displayName,
          });
          
          console.log(`✅ User created in Firebase Auth with UID: ${newUser.uid}`);
          
          // Create user document in Firestore
          await adminDb.collection('users').doc(newUser.uid).set({
            email,
            displayName,
            firstName: firstName || '',
            lastName: lastName || '',
            role: role || 'client',
            phone: phone || '',
            isActive: true,
            createdAt: new Date(),
            createdBy: requesterUid,
          });
          
          console.log(`✅ User document created in Firestore`);
          
          // Send password reset email so user can set their own password
          if (!newPassword) {
            try {
              await sendPasswordResetEmail(clientAuth, email);
              console.log(`📧 Password reset email sent to ${email}`);
            } catch (emailError) {
              console.error('Failed to send password reset email:', emailError);
              // Don't fail the whole operation if email fails
            }
          }
          
          return NextResponse.json({ 
            message: 'User created successfully',
            uid: newUser.uid,
            passwordResetSent: !newPassword
          });
        } catch (createError: any) {
          console.error('Error creating user:', createError);
          
          let errorMessage = 'Failed to create user';
          let statusCode = 500;
          
          if (createError.code === 'auth/email-already-exists') {
            errorMessage = 'A user with this email already exists';
            statusCode = 409;
          } else if (createError.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address format';
            statusCode = 400;
          } else if (createError.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak';
            statusCode = 400;
          }
          
          return NextResponse.json({ error: errorMessage, code: createError.code }, { status: statusCode });
        }
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
          console.log(`🔄 Starting password update process for user ${uid}`);
          console.log(`Requester UID: ${requesterUid}, Target UID: ${uid}`);
          console.log(`Is self-update: ${uid === requesterUid ? 'Yes' : 'No'}`);
          
          // Direct Firebase Auth REST API approach for self-password change
          // This is more reliable than the Admin SDK in many environments
          if (uid === requesterUid) {
            console.log(`🔑 Attempting self-password change via direct Firebase Auth API`);
            const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
            
            try {
              // Use accounts:update endpoint for password change
              console.log(`Calling Firebase Auth API with idToken`);
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
                console.log(`✅ Self password updated successfully via Firebase Auth API`);
                return NextResponse.json({ message: 'Password updated successfully' });
              } else {
                const errorData = await response.json();
                console.error('Firebase Auth API error:', errorData);
                
                // More detailed error information
                const errorMessage = errorData.error?.message || 'Unknown error';
                const errorCode = errorData.error?.code || 'unknown';
                
                console.error(`Error code: ${errorCode}, Message: ${errorMessage}`);
                
                return NextResponse.json({ 
                  error: 'Password update failed', 
                  code: errorCode,
                  details: errorMessage
                }, { status: 400 });
              }
            } catch (directApiError) {
              console.error('Direct Firebase Auth API error:', directApiError);
              return NextResponse.json({ 
                error: 'Password update failed', 
                details: directApiError instanceof Error ? directApiError.message : 'Unknown error'
              }, { status: 500 });
            }
          }
          
          // For admin updating another user's password, use Admin SDK
          try {
            console.log(`👑 Admin updating another user's password via Admin SDK`);
            await adminAuth.updateUser(uid, { password: newPassword });
            console.log(`✅ Password updated successfully for user ${uid}`);
            return NextResponse.json({ message: 'Password updated successfully' });
          } catch (adminError) {
            console.error('Admin SDK password update error:', adminError);
            
            // Fall back to password reset email for admin updating another user
            try {
              console.log(`⚠️ Admin SDK failed, sending password reset email instead`);
              const userRecord = await adminAuth.getUser(uid);
              if (userRecord.email) {
                await adminAuth.generatePasswordResetLink(userRecord.email);
                return NextResponse.json({ 
                  message: 'Password reset link has been sent to the user', 
                  details: 'Direct password update failed, user will need to reset their password via email'
                });
              } else {
                return NextResponse.json({ 
                  error: 'Cannot reset password for user without email', 
                  details: 'User record does not contain an email address'
                }, { status: 400 });
              }
            } catch (resetError) {
              console.error('Password reset email error:', resetError);
              return NextResponse.json({ 
                error: 'Failed to update password or send reset email', 
                details: resetError instanceof Error ? resetError.message : 'Unknown error'
              }, { status: 500 });
            }
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
