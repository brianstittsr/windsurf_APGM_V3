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
    if (/pretty\s*girl\s*preview/i.test(d.name || '')) {
      console.log(`${doc.id}:`, JSON.stringify({ name: d.name, duration: d.duration, price: d.price, category: d.category, deposit: d.deposit }));
    }
  });
})();
