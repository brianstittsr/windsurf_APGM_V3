import { NextResponse } from 'next/server';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    // First, verify the requesting user is an admin.
    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const requesterUid = decodedToken.uid;

    const userDoc = await adminDb.collection('users').doc(requesterUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Proceed with the requested action
    const { action, uid, email, newPassword } = await req.json();

    if (!action || !uid) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    switch (action) {
      case 'reset_password':
        if (!email) {
          return NextResponse.json({ error: 'Email is required to send a password reset link' }, { status: 400 });
        }
        // Note: Firebase Admin SDK cannot directly send the standard reset email.
        // It generates a link. For a better user experience, we will trigger this from the client.
        // However, if we must do it from the backend, we would generate a link and use a mail service.
        // This case is added for completeness, but the client-side approach is preferred.
        const link = await adminAuth.generatePasswordResetLink(email);
        // Here you would email the link to the user using a service like SendGrid, Nodemailer, etc.
        console.log(`Password reset link for ${email}: ${link}`);
        return NextResponse.json({ message: `A password reset link would be sent to ${email} if an email service were configured.` });

      case 'update_password':
        if (!newPassword) {
          return NextResponse.json({ error: 'New password is required' }, { status: 400 });
        }
        if (newPassword.length < 6) {
          return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }
        await adminAuth.updateUser(uid, { password: newPassword });
        return NextResponse.json({ message: 'Password updated successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in user management API:', error);

    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Authentication token has expired. Please log in again.' }, { status: 401 });
    }
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
