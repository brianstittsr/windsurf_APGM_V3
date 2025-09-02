// Run this in Firebase Console JavaScript console
// Go to: https://console.firebase.google.com/project/aprettygirlmatterllc/firestore/data
// Open browser dev tools (F12) and paste this in the console

const victoriaSchedule = [
  {
    id: 'victoria_monday',
    artistId: 'victoria',
    dayOfWeek: 'monday',
    isEnabled: false,
    timeRanges: [],
    servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
  },
  {
    id: 'victoria_tuesday',
    artistId: 'victoria',
    dayOfWeek: 'tuesday',
    isEnabled: false,
    timeRanges: [],
    servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
  },
  {
    id: 'victoria_wednesday',
    artistId: 'victoria',
    dayOfWeek: 'wednesday',
    isEnabled: false,
    timeRanges: [],
    servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
  },
  {
    id: 'victoria_thursday',
    artistId: 'victoria',
    dayOfWeek: 'thursday',
    isEnabled: false,
    timeRanges: [],
    servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
  },
  {
    id: 'victoria_friday',
    artistId: 'victoria',
    dayOfWeek: 'friday',
    isEnabled: false,
    timeRanges: [],
    servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
  },
  {
    id: 'victoria_saturday',
    artistId: 'victoria',
    dayOfWeek: 'saturday',
    isEnabled: true,
    timeRanges: [{
      id: 'sat-morning',
      startTime: '9:00 AM',
      endTime: '1:00 PM',
      isActive: true
    }],
    servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
  },
  {
    id: 'victoria_sunday',
    artistId: 'victoria',
    dayOfWeek: 'sunday',
    isEnabled: true,
    timeRanges: [{
      id: 'sun-morning',
      startTime: '9:00 AM',
      endTime: '1:00 PM',
      isActive: true
    }],
    servicesOffered: ['Blade & Shade Eyebrows', 'Powder Brows', 'Lip Blush', 'Eyeliner']
  }
];

console.log('Victoria Schedule Data:', victoriaSchedule);
console.log('Copy each object above and create documents manually in Firebase Console');
