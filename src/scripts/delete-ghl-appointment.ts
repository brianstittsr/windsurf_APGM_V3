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
const EVENT_ID = 'CFmEUuRxd9yxKmJUUcVQ';

async function getGHLCredentials() {
  try {
    const settingsDoc = await db.collection('crmSettings').doc('gohighlevel').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return {
        apiKey: data?.apiKey || process.env.GHL_API_KEY || '',
        locationId: data?.locationId || process.env.GHL_LOCATION_ID || ''
      };
    }
  } catch {}
  return { apiKey: process.env.GHL_API_KEY || '', locationId: process.env.GHL_LOCATION_ID || '' };
}

async function main() {
  const { apiKey, locationId } = await getGHLCredentials();
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Version': '2021-07-28' };

  // 1) Fetch and show the full event
  const getRes = await fetch(
    `https://services.leadconnectorhq.com/calendars/events/appointments/${EVENT_ID}`,
    { headers }
  );
  if (!getRes.ok) {
    console.log(`Event not found (${getRes.status}) — already deleted?`);
    return;
  }
  const data = await getRes.json();
  const appt = data.appointment || data;
  console.log('Event to delete:');
  console.log(`  id:        ${appt.id}`);
  console.log(`  title:     ${appt.title}`);
  console.log(`  calendar:  ${appt.calendarId}`);
  console.log(`  contact:   ${appt.contactId}`);
  console.log(`  start:     ${appt.startTime}`);
  console.log(`  end:       ${appt.endTime}`);
  console.log(`  status:    ${appt.appointmentStatus}`);

  // 2) Delete it
  const delRes = await fetch(
    `https://services.leadconnectorhq.com/calendars/events/appointments/${EVENT_ID}`,
    { method: 'DELETE', headers }
  );
  console.log(`\nDELETE → HTTP ${delRes.status}`);
  const delBody = await delRes.text().catch(() => '');
  if (delBody) console.log(`  response: ${delBody.slice(0, 300)}`);

  // 3) Verify
  const verifyRes = await fetch(
    `https://services.leadconnectorhq.com/calendars/events/appointments/${EVENT_ID}`,
    { headers }
  );
  console.log(`\nVerify GET → HTTP ${verifyRes.status} ${verifyRes.status === 404 || verifyRes.status === 400 ? '(gone ✓)' : '(still exists?)'}`);
}

main().then(() => process.exit(0)).catch(e => { console.error('Failed:', e); process.exit(1); });
