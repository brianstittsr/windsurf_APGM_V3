import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

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

// Target: October 3, 2026 (Eastern Time). Oct 3 2026 is EDT = UTC-4.
const TARGET_DATE = '2026-10-03';
const ET_OFFSET_HOURS = 4;
const dayStartUTC = new Date(`${TARGET_DATE}T0${ET_OFFSET_HOURS}:00:00.000Z`); // 00:00 ET
const dayEndUTC = new Date(`${TARGET_DATE}T0${ET_OFFSET_HOURS}:00:00.000Z`);
dayEndUTC.setUTCDate(dayEndUTC.getUTCDate() + 1); // 00:00 ET next day

// Window the user cares about: 2:30 PM - 6:00 PM ET
const WINDOW_START_MIN = 14 * 60 + 30;
const WINDOW_END_MIN = 18 * 60;

const toMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

const inferDurationMin = (serviceName?: string, time?: string, endTime?: string, duration?: number): number => {
  if (time && endTime) {
    const diff = toMinutes(endTime) - toMinutes(time);
    if (diff > 0) return diff;
  }
  if (typeof duration === 'number' && duration > 0) return duration;
  if (serviceName && /pretty\s+girl\s+preview/i.test(serviceName)) return 30;
  if (serviceName && /consult/i.test(serviceName)) return 45;
  return 180;
};

const overlapsWindow = (startMin: number, endMin: number) =>
  startMin < WINDOW_END_MIN && endMin > WINDOW_START_MIN;

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
  } catch (error) {
    console.error('Error fetching GHL credentials:', error);
  }
  return {
    apiKey: process.env.GHL_API_KEY || '',
    locationId: process.env.GHL_LOCATION_ID || ''
  };
}

async function main() {
  console.log(`🔎 Diagnosing booking blocks for ${TARGET_DATE} (ET), window 2:30 PM - 6:00 PM\n`);

  // ---------- 1) Website (Firestore) bookings ----------
  console.log('='.repeat(80));
  console.log('WEBSITE (Firestore) bookings on this date');
  console.log('='.repeat(80));

  const seen = new Set<string>();
  const firestoreBookings: any[] = [];

  for (const field of ['date', 'appointmentDate']) {
    const snap = await db.collection('bookings').where(field, '==', TARGET_DATE).get();
    snap.docs.forEach(doc => {
      if (seen.has(doc.id)) return;
      seen.add(doc.id);
      firestoreBookings.push({ id: doc.id, ...doc.data() });
    });
  }

  if (firestoreBookings.length === 0) {
    console.log('  No Firestore bookings found for this date.\n');
  }

  firestoreBookings.forEach(b => {
    const start = toMinutes(b.time || b.appointmentTime || '00:00');
    const dur = inferDurationMin(b.serviceName, b.time || b.appointmentTime, b.endTime, b.duration);
    const end = start + dur;
    const endStr = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
    const blocking = overlapsWindow(start, end);
    console.log(`${blocking ? '🚫 BLOCKING ' : '   ok       '} | ${b.clientName || b.name || 'Unknown'} | ${b.serviceName || ''} | ${b.time || b.appointmentTime} - ${b.endTime || endStr} | id=${b.id}${b.ghlAppointmentId ? ` | ghlId=${b.ghlAppointmentId}` : ''}`);
  });
  console.log();

  // ---------- 1b) Other collections that can block the public calendar ----------
  console.log('='.repeat(80));
  console.log('appointments collection (public booking flow) on this date');
  console.log('='.repeat(80));

  const seenAppts = new Set<string>();
  const apptDocs: any[] = [];
  for (const field of ['date', 'appointmentDate']) {
    const snap = await db.collection('appointments').where(field, '==', TARGET_DATE).get();
    snap.docs.forEach(doc => {
      if (seenAppts.has(doc.id)) return;
      seenAppts.add(doc.id);
      apptDocs.push({ id: doc.id, ...doc.data() });
    });
  }
  if (apptDocs.length === 0) {
    console.log('  No appointment docs found for this date.\n');
  }
  apptDocs.forEach(b => {
    const t = b.time || b.appointmentTime || '00:00';
    const start = toMinutes(t);
    const dur = inferDurationMin(b.serviceName, t, b.endTime, b.duration);
    const end = start + dur;
    const endStr = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
    const blocking = overlapsWindow(start, end);
    console.log(`  ${blocking ? '🚫 BLOCKING ' : '   ok       '} | ${b.clientName || b.name || 'Unknown'} | ${b.serviceName || ''} | ${t} - ${b.endTime || endStr} | status=${b.status} | id=${b.id}`);
  });
  console.log();

  console.log('='.repeat(80));
  console.log('availability collection docs for this date');
  console.log('='.repeat(80));
  const availSnap = await db.collection('availability').where('date', '==', TARGET_DATE).get();
  if (availSnap.empty) {
    console.log('  No availability docs for this date.\n');
  }
  availSnap.docs.forEach(doc => {
    const d = doc.data();
    console.log(`  doc ${doc.id}:`, JSON.stringify(d).slice(0, 500));
  });
  console.log();

  console.log('='.repeat(80));
  console.log('artistAvailability weekly config (Saturday = day this date falls on)');
  console.log('='.repeat(80));
  const artistSnap = await db.collection('artistAvailability').get();
  if (artistSnap.empty) {
    console.log('  No artistAvailability docs found.\n');
  }
  artistSnap.docs.forEach(doc => {
    const d = doc.data();
    if (doc.id.includes('saturday') || d.dayOfWeek === 'saturday') {
      console.log(`  ${doc.id}:`, JSON.stringify(d, null, 2));
    }
  });
  console.log();

  // Scan ALL bookings whose ISO startTime falls inside this ET day (catches docs
  // that store startTime but not date/appointmentDate).
  console.log('='.repeat(80));
  console.log('bookings with ISO startTime inside this ET day');
  console.log('='.repeat(80));
  const allBookings = await db.collection('bookings').get();
  let isoCount = 0;
  allBookings.docs.forEach(doc => {
    const d = doc.data();
    if (!d.startTime || typeof d.startTime !== 'string' || !d.startTime.includes('T')) return;
    const s = new Date(d.startTime);
    if (s >= dayStartUTC && s < dayEndUTC) {
      isoCount++;
      console.log(`  ${doc.id} | ${d.name || d.clientName || '?'} | ${d.serviceName || d.title || ''} | startTime=${d.startTime} | endTime=${d.endTime}`);
    }
  });
  if (isoCount === 0) console.log('  None found.\n');

  // ---------- 2) GHL appointments ----------
  console.log('='.repeat(80));
  console.log('GHL calendar appointments on this date');
  console.log('='.repeat(80));

  const { apiKey, locationId } = await getGHLCredentials();
  if (!apiKey || !locationId) {
    console.log('  ❌ GHL credentials not configured — skipping GHL check.');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Version': '2021-07-28'
  };

  const calendarsRes = await fetch(
    `https://services.leadconnectorhq.com/calendars/?locationId=${locationId}`,
    { headers }
  );

  if (!calendarsRes.ok) {
    console.log(`  ❌ Failed to list GHL calendars: ${calendarsRes.status}`);
    return;
  }

  const calendarsData = await calendarsRes.json();
  const calendars = calendarsData.calendars || [];
  console.log(`  Found ${calendars.length} GHL calendar(s)\n`);

  const startParam = encodeURIComponent(dayStartUTC.toISOString());
  const endParam = encodeURIComponent(dayEndUTC.toISOString());

  for (const calendar of calendars) {
    const url = `https://services.leadconnectorhq.com/calendars/events?calendarId=${calendar.id}&locationId=${locationId}&startTime=${startParam}&endTime=${endParam}`;
    let events: any[] = [];
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        events = data.events || [];
      } else {
        console.log(`  ⚠️  ${calendar.name}: fetch failed (${res.status})`);
      }
    } catch (e) {
      console.log(`  ⚠️  ${calendar.name}: fetch error ${e}`);
    }

    if (events.length === 0) {
      console.log(`  "${calendar.name}" (${calendar.id}): no events this day`);
      continue;
    }

    console.log(`  "${calendar.name}" (${calendar.id}):`);
    events.forEach((ev: any) => {
      const s = new Date(ev.startTime);
      const e = new Date(ev.endTime);
      // Convert UTC to ET minutes-since-midnight (EDT = UTC-4)
      const etStart = new Date(s.getTime() - ET_OFFSET_HOURS * 3600000);
      const etEnd = new Date(e.getTime() - ET_OFFSET_HOURS * 3600000);
      const startMin = etStart.getUTCHours() * 60 + etStart.getUTCMinutes();
      const endMin = etEnd.getUTCHours() * 60 + etEnd.getUTCMinutes();
      const startStr = etStart.toISOString().slice(11, 16);
      const endStr = etEnd.toISOString().slice(11, 16);
      const blocking = overlapsWindow(startMin, endMin);
      console.log(`    ${blocking ? '🚫 BLOCKING ' : '   ok       '} | ${ev.title || 'Untitled'} | ${startStr}-${endStr} ET | status=${ev.appointmentStatus || ev.status} | id=${ev.id} | contact=${ev.contactId || 'n/a'}`);
    });

    // Blocked slots
    try {
      const blockRes = await fetch(
        `https://services.leadconnectorhq.com/calendars/${calendar.id}/blockedSlots?locationId=${locationId}&startTime=${startParam}&endTime=${endParam}`,
        { headers }
      );
      if (blockRes.ok) {
        const blockData = await blockRes.json();
        const blocks = blockData.blockedSlots || blockData.events || [];
        if (blocks.length > 0) {
          console.log(`    Blocked slots:`);
          blocks.forEach((b: any) => {
            const s = new Date(b.startTime);
            const e = new Date(b.endTime);
            const etStart = new Date(s.getTime() - ET_OFFSET_HOURS * 3600000);
            const etEnd = new Date(e.getTime() - ET_OFFSET_HOURS * 3600000);
            const startMin = etStart.getUTCHours() * 60 + etStart.getUTCMinutes();
            const endMin = etEnd.getUTCHours() * 60 + etEnd.getUTCMinutes();
            const startStr = etStart.toISOString().slice(11, 16);
            const endStr = etEnd.toISOString().slice(11, 16);
            const blocking = overlapsWindow(startMin, endMin);
            console.log(`      ${blocking ? '🚫 BLOCKING ' : '   ok       '} | ${b.title || 'Blocked'} | ${startStr}-${endStr} ET | id=${b.id}`);
          });
        }
      }
    } catch {}
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
