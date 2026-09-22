import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  initializeApp({ credential: cert(serviceAccount as any) });
}

const db = getFirestore();
const BOOKING_ID = 'Oha1C3VotNM6FGRYlQGC';

async function main() {
  const ref = db.collection('bookings').doc(BOOKING_ID);
  const snap = await ref.get();

  if (!snap.exists) {
    console.log(`Booking ${BOOKING_ID} not found — already deleted.`);
    return;
  }

  const d = snap.data()!;
  console.log(`Deleting: ${d.clientName || d.name} | ${d.serviceName} | ${d.date} ${d.time}-${d.endTime || ''}`);
  await ref.delete();
  console.log('✅ Deleted.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1); });
