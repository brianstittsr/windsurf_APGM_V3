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

// Oct 3 2026 is EDT = UTC-4. Whole ET day in UTC:
const startUTC = '2026-10-03T04:00:00.000Z';
const endUTC = '2026-10-04T04:00:00.000Z';
const ET_OFFSET_MS = 4 * 3600000;

const et = (iso: string) => {
  const d = new Date(new Date(iso).getTime() - ET_OFFSET_MS);
  return d.toISOString().slice(11, 16);
};

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

  // Calendars: dynamic list + hardcoded known IDs from other scripts
  const calendarIds = new Set<string>();
  const listRes = await fetch(`https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`, { headers });
  if (listRes.ok) {
    const d = await listRes.json();
    (d.calendars || []).forEach((c: any) => calendarIds.add(c.id));
  }
  ['C9kiOUUFTpnSSqGurWh1', 'JvcOyRMMYoIPbH5s1Bg1', 'apjAQhxGgapiXteQga42', 'lrcO6wctZdKrnhb8iwye'].forEach(id => calendarIds.add(id));

  const sp = encodeURIComponent(startUTC);
  const ep = encodeURIComponent(endUTC);

  for (const calId of calendarIds) {
    console.log(`\n=== Calendar ${calId} ===`);

    // Events
    for (const evPath of [`calendars/events`, `calendars/events/appointments`]) {
      try {
        const res = await fetch(
          `https://services.leadconnectorhq.com/${evPath}?locationId=${locationId}&calendarId=${calId}&startTime=${sp}&endTime=${ep}`,
          { headers }
        );
        const data = await res.json().catch(() => ({}));
        console.log(`  ${evPath}: HTTP ${res.status}, ${(data.events || []).length} event(s)`);
        const events = data.events || [];
        events.forEach((e: any) => {
          console.log(`    EVENT | ${e.title || 'Untitled'} | ${et(e.startTime)}-${et(e.endTime)} ET | status=${e.appointmentStatus || e.status} | id=${e.id} | calendarId=${e.calendarId} | contact=${e.contactId || 'n/a'}`);
        });
      } catch (e) {
        console.log(`  ${evPath}: error ${e}`);
      }
    }

    // Blocked slots
    try {
      const res = await fetch(
        `https://services.leadconnectorhq.com/calendars/${calId}/blockedSlots?locationId=${locationId}&startTime=${sp}&endTime=${ep}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        const blocks = data.blockedSlots || data.events || data.data || [];
        blocks.forEach((b: any) => {
          console.log(`  BLOCKED SLOT | ${b.title || 'Blocked'} | ${et(b.startTime)}-${et(b.endTime)} ET | id=${b.id} | calendarId=${calId}`);
        });
      } else {
        console.log(`  blockedSlots fetch: ${res.status}`);
      }
    } catch (e) {
      console.log(`  blockedSlots error: ${e}`);
    }
  }

  // Direct lookup of the previously-linked appointment ID
  console.log('\n=== Direct event lookup: CFmEUuRxd9yxKmJUUcVQ ===');
  for (const calId of calendarIds) {
    for (const base of ['events/appointments', 'calendars/events/appointments']) {
      try {
        const res = await fetch(
          `https://services.leadconnectorhq.com/${base}/CFmEUuRxd9yxKmJUUcVQ`,
          { headers }
        );
        if (res.ok) {
          const d = await res.json();
          console.log(`  FOUND via ${base}:`, JSON.stringify(d).slice(0, 400));
        }
      } catch {}
    }
  }

  // Also check calendar-level config (which days/hours the calendar allows)
  console.log('\n=== Calendar configs ===');
  for (const calId of calendarIds) {
    try {
      const res = await fetch(`https://services.leadconnectorhq.com/calendars/${calId}`, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      const cal = data.calendar || data;
      console.log(`${calId} | ${cal.name} | groupId=${cal.groupId || 'n/a'} | slotDuration=${cal.slotDuration} | openHours=${JSON.stringify(cal.openHours?.filter((d: any) => d?.daysOfTheWeek?.includes(6)) || 'n/a')}`);
    } catch {}
  }
}

main().then(() => process.exit(0)).catch(e => { console.error('Failed:', e); process.exit(1); });
