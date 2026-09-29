import { db } from '../lib/firebase-admin';

async function seed() {
  const config = {
    enabled: true,
    imageUrl: '/images/hero/victoria-escobar-hero-main.jpg',
    title: 'Quick Virtual Consultation',
    description: 'Book a 30-minute virtual appointment with Victoria.',
    serviceName: 'The Pretty Girl Preview * Virtual Consultation',
    duration: 30,
    days: [2, 4],
    startTime: '16:30',
    endTime: '18:00',
    maxWeeksAhead: 4,
    calendarId: '',
  };

  await db.collection('quickVirtualAppointment').doc('config').set(config);
  console.log('Quick Virtual Appointment config seeded:', config);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
