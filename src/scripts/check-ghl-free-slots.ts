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

async function main() {
  const s = await db.collection('crmSettings').doc('gohighlevel').get();
  const apiKey = s.data()?.apiKey || process.env.GHL_API_KEY;
  const calendarId = 'C9kiOUUFTpnSSqGurWh1';

  // Oct 3 2026 00:00 ET = 04:00 UTC; end Oct 4 00:00 ET
  const startMs = Date.parse('2026-10-03T04:00:00.000Z');
  const endMs = Date.parse('2026-10-04T04:00:00.000Z');

  const res = await fetch(
    `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${startMs}&endDate=${endMs}`,
    { headers: { 'Authorization': `Bearer ${apiKey}`, 'Version': '2021-07-28' } }
  );
  console.log(`free-slots → HTTP ${res.status}`);
  const d = await res.json();
  const slots = d['2026-10-03']?.slots || d.slots || [];
  console.log(`Oct 3 slots (${slots.length}):`);
  slots.forEach((t: string) => console.log('  ', t));
}

main().then(() => process.exit(0)).catch(e => { console.error('Failed:', e); process.exit(1); });
