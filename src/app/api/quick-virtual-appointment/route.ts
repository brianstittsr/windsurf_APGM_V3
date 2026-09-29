import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

interface QuickVirtualConfig {
  enabled: boolean;
  imageUrl: string;
  imageUrl2: string;
  title: string;
  description: string;
  serviceName: string;
  zoomLink: string;
  duration: number;
  days: number[];
  startTime: string;
  endTime: string;
  maxWeeksAhead: number;
  calendarId: string;
}

const defaultConfig: QuickVirtualConfig = {
  enabled: true,
  imageUrl: '/images/hero/victoria-escobar-hero-main.jpg',
  imageUrl2: '',
  title: 'Quick Virtual Consultation',
  description: 'Book a 30-minute virtual appointment with Victoria.',
  serviceName: 'The Pretty Girl Preview * Virtual Consultation',
  zoomLink: 'https://us05web.zoom.us/j/2989268538?pwd=Q4wtUTamIablNDnZzDiX6a4sWQqNcB.1#success',
  duration: 30,
  days: [2, 4],
  startTime: '16:30',
  endTime: '18:00',
  maxWeeksAhead: 4,
  calendarId: '',
};

function getEasternOffset(date: Date): number {
  const year = date.getUTCFullYear();
  const march = new Date(Date.UTC(year, 2, 1));
  let sundays = 0;
  while (sundays < 2) {
    if (march.getUTCDay() === 0) sundays++;
    if (sundays < 2) march.setUTCDate(march.getUTCDate() + 1);
  }
  const november = new Date(Date.UTC(year, 10, 1));
  while (november.getUTCDay() !== 0) {
    november.setUTCDate(november.getUTCDate() + 1);
  }
  const isDST = date >= march && date < november;
  return isDST ? -4 : -5; // Eastern offset from UTC in hours
}

function toEastern(date: Date): Date {
  const offsetHours = getEasternOffset(date);
  return new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
}

function getEasternDateParts(date: Date): { year: number; month: number; day: number; dayOfWeek: number } {
  const eastern = toEastern(date);
  return {
    year: eastern.getUTCFullYear(),
    month: eastern.getUTCMonth() + 1,
    day: eastern.getUTCDate(),
    dayOfWeek: eastern.getUTCDay(),
  };
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hours: h, minutes: m };
}

function formatEasternTime(date: Date): string {
  const eastern = toEastern(date);
  let hours = eastern.getUTCHours();
  const minutes = eastern.getUTCMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

function formatEasternDate(date: Date): string {
  const eastern = toEastern(date);
  return eastern.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export async function GET(_request: NextRequest) {
  try {
    const configSnap = await db.collection('quickVirtualAppointment').doc('config').get();
    const config = configSnap.exists
      ? { ...defaultConfig, ...(configSnap.data() as QuickVirtualConfig) }
      : defaultConfig;

    if (!config.enabled) {
      return NextResponse.json({ enabled: false });
    }

    // Load existing bookings for this service so we can block taken slots.
    const bookingsSnap = await db
      .collection('bookings')
      .where('serviceName', '==', config.serviceName)
      .get();

    const taken = new Set<string>();
    bookingsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.date && data.time) {
        taken.add(`${data.date}T${data.time}`);
      }
    });

    const { days, startTime, endTime, duration, maxWeeksAhead } = config;
    const slots: Array<{
      date: string;
      time: string;
      label: string;
      startTime: string;
      endTime: string;
    }> = [];

    const now = new Date();
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    for (let d = 0; d < maxWeeksAhead * 7; d++) {
      // Build candidate date in UTC, then determine the corresponding Eastern
      // weekday so we match the configured days (Tuesday/Thursday) in local time.
      const base = new Date(now);
      base.setUTCDate(now.getUTCDate() + d);
      const parts = getEasternDateParts(base);
      if (!days.includes(parts.dayOfWeek)) continue;

      // Convert the configured Eastern start/end times to UTC for this date.
      const offset = getEasternOffset(new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0)));
      let current = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, start.hours - offset, start.minutes));
      const limit = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, end.hours - offset, end.minutes));

      while (current < limit) {
        const next = new Date(current.getTime() + duration * 60000);
        if (next > limit) break;

        const eastern = toEastern(current);
        const dateStr = `${eastern.getUTCFullYear()}-${(eastern.getUTCMonth() + 1).toString().padStart(2, '0')}-${eastern.getUTCDate().toString().padStart(2, '0')}`;
        const timeStr = `${eastern.getUTCHours().toString().padStart(2, '0')}:${eastern.getUTCMinutes().toString().padStart(2, '0')}`;

        if (current > now && !taken.has(`${dateStr}T${timeStr}`)) {
          slots.push({
            date: dateStr,
            time: timeStr,
            label: `${formatEasternDate(current)} at ${formatEasternTime(current)}`,
            startTime: current.toISOString(),
            endTime: next.toISOString(),
          });
        }

        current = next;
      }
    }

    return NextResponse.json({ enabled: true, config, slots });
  } catch (error) {
    console.error('Error loading quick virtual appointment data:', error);
    return NextResponse.json(
      { error: 'Failed to load appointment data' },
      { status: 500 }
    );
  }
}
