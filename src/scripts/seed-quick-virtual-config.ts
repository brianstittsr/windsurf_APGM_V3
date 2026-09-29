import { db } from '../lib/firebase-admin';

async function seed() {
  const config = {
    enabled: true,
    imageUrls: [
      '/images/hero/victoria-escobar-hero-main.jpg',
      'https://images.pexels.com/photos/7606041/pexels-photo-7606041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/9301861/pexels-photo-9301861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/4031707/pexels-photo-4031707.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/34225007/pexels-photo-34225007.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/36766896/pexels-photo-36766896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/7921261/pexels-photo-7921261.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/7971645/pexels-photo-7971645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/7545362/pexels-photo-7545362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
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

  await db.collection('quickVirtualAppointment').doc('config').set(config);
  console.log('Quick Virtual Appointment config seeded:', config);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
