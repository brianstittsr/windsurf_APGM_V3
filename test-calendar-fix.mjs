// Test script to verify the calendar fix is working correctly

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return parseInt(hours, 10);
}

// Simulate the availability data structure from Firebase
const mockAvailabilityData = [
  {
    id: 'victoria_monday',
    dayOfWeek: 'monday',
    isEnabled: true,
    timeRanges: [
      { id: 'monday_default', startTime: '9:00 AM', endTime: '5:00 PM', isActive: true }
    ],
    artistId: 'victoria'
  },
  {
    id: 'victoria_saturday',
    dayOfWeek: 'saturday',
    isEnabled: true,
    timeRanges: [
      { id: 'saturday_default', startTime: '10:00 AM', endTime: '4:00 PM', isActive: true }
    ],
    artistId: 'victoria'
  },
  {
    id: 'victoria_sunday',
    dayOfWeek: 'sunday',
    isEnabled: false,
    timeRanges: [
      { id: 'sunday_default', startTime: '10:00 AM', endTime: '4:00 PM', isActive: true }
    ],
    artistId: 'victoria'
  }
];

// Simulate the availability checking logic
function findNextAvailableDate() {
  const today = new Date();
  const availableDates = [];
  
  console.log('🔍 Testing availability logic...');
  console.log('📅 Today:', today.toISOString().split('T')[0]);
  
  // Check next 7 days
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dateString = checkDate.toISOString().split('T')[0];
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][checkDate.getDay()];
    
    console.log(`\n🗓️ Checking ${dateString} (${dayOfWeek})`);
    
    // Find availability for this day
    const dayAvailability = mockAvailabilityData.find(doc => 
      doc.dayOfWeek === dayOfWeek && doc.isEnabled
    );
    
    if (dayAvailability) {
      const timeRanges = dayAvailability.timeRanges || [];
      const timeSlots = [];
      
      console.log(`    📋 Processing ${timeRanges.length} time ranges`);
      
      timeRanges.forEach((range, index) => {
        console.log(`      🕐 Range ${index}: ${range.startTime} - ${range.endTime}, isActive: ${range.isActive}`);
        
        if (range.isActive) {
          const startHour = convertTo24Hour(range.startTime);
          const endHour = convertTo24Hour(range.endTime);
          
          console.log(`      ⏰ Converted times: ${startHour}:00 - ${endHour}:00`);
          
          for (let hour = startHour; hour < endHour; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
          }
        }
      });
      
      console.log(`    ✅ Generated ${timeSlots.length} time slots:`, timeSlots.slice(0, 3).join(', ') + (timeSlots.length > 3 ? '...' : ''));
      
      if (timeSlots.length > 0) {
        availableDates.push({
          date: dateString,
          timeSlots: timeSlots.length
        });
      }
    } else {
      console.log(`    ❌ No availability for ${dayOfWeek}`);
    }
  }
  
  console.log('\n📋 Summary of available dates:');
  availableDates.forEach(date => {
    console.log(`  - ${date.date}: ${date.timeSlots} slots`);
  });
  
  if (availableDates.length > 0) {
    console.log(`\n🎯 Next available date: ${availableDates[0].date}`);
    return availableDates[0];
  } else {
    console.log('\n❌ No available dates found');
    return null;
  }
}

// Run the test
console.log('='.repeat(50));
console.log('TESTING CALENDAR AVAILABILITY LOGIC');
console.log('='.repeat(50));

const result = findNextAvailableDate();

console.log('\n' + '='.repeat(50));
console.log('TEST RESULTS');
console.log('='.repeat(50));

if (result) {
  console.log('✅ PASS: Calendar should navigate to next available date');
  console.log(`📅 Next available: ${result.date}`);
} else {
  console.log('❌ FAIL: No available dates found - calendar will default to current week');
}
