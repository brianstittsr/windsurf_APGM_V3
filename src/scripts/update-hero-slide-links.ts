import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const NEW_LINK = 'https://link.socaldigitalstudio.com/widget/form/wxQMl8ZFz9MiWtrKYlnP';

(async () => {
  const snap = await db.collection('heroSlides').get();
  let updated = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.buttonLink === NEW_LINK) {
      console.log(`Skipping unchanged: ${doc.id}`);
      continue;
    }
    await db.collection('heroSlides').doc(doc.id).update({
      buttonLink: NEW_LINK,
      updatedAt: new Date(),
    });
    console.log(`Updated ${doc.id}: ${data.buttonLink || '(none)'} -> ${NEW_LINK}`);
    updated++;
  }
  console.log(`\nDone. Updated ${updated} hero slide(s).`);
})();
