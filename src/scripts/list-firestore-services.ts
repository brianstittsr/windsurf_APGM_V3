import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
  }) });
}
const db = getFirestore();

(async () => {
  const snap = await db.collection('services').get();
  snap.docs.forEach(doc => {
    const d = doc.data();
    console.log(`${doc.id} | ${d.name} | ${d.category} | price=${d.price} | duration=${d.duration} | link=${d.link || ''} | active=${d.isActive}`);
  });
})();
