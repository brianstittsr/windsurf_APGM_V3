import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import QRCode from 'qrcode';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

async function generateQRCodeImage(url: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

async function initializeFacebookReviewsQR() {
  try {
    console.log('🚀 Initializing Facebook Reviews QR Code...');

    const facebookReviewsUrl = 'https://www.facebook.com/people/A-Pretty-Girl-Matter/61581970516037/?sk=reviews';
    
    // Generate QR code image
    console.log('📱 Generating QR code image...');
    const qrCodeDataUrl = await generateQRCodeImage(facebookReviewsUrl);

    // Check if Facebook Reviews QR code already exists
    const qrCodesRef = db.collection('qr-codes');
    const existingQRs = await qrCodesRef
      .where('name', '==', 'Facebook Reviews')
      .get();

    if (!existingQRs.empty) {
      console.log('✅ Facebook Reviews QR code already exists. Updating...');
      const docRef = existingQRs.docs[0].ref;
      await docRef.update({
        url: facebookReviewsUrl,
        qrCodeDataUrl,
        description: 'Scan to leave a review on our Facebook page',
        isActive: true,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Facebook Reviews QR code updated successfully!');
    } else {
      console.log('📝 Creating new Facebook Reviews QR code...');
      await qrCodesRef.add({
        name: 'Facebook Reviews',
        url: facebookReviewsUrl,
        description: 'Scan to leave a review on our Facebook page',
        qrCodeDataUrl,
        scans: 0,
        isActive: true,
        createdAt: Timestamp.now()
      });
      console.log('✅ Facebook Reviews QR code created successfully!');
    }

    console.log('🎉 Initialization complete!');
    console.log('📍 URL:', facebookReviewsUrl);
    console.log('🔗 You can now access the QR code in the admin dashboard under "QR Codes" tab');

  } catch (error) {
    console.error('❌ Error initializing Facebook Reviews QR code:', error);
    throw error;
  }
}

// Run the initialization
initializeFacebookReviewsQR()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
