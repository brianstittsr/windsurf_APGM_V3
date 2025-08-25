// Test script to verify time conversion logic
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

// Test the conversion function
console.log('Testing time conversion:');
console.log('9:00 AM ->', convertTo24Hour('9:00 AM')); // Should be 9
console.log('5:00 PM ->', convertTo24Hour('5:00 PM')); // Should be 17
console.log('12:00 PM ->', convertTo24Hour('12:00 PM')); // Should be 12
console.log('12:00 AM ->', convertTo24Hour('12:00 AM')); // Should be 0
console.log('10:00 AM ->', convertTo24Hour('10:00 AM')); // Should be 10
console.log('4:00 PM ->', convertTo24Hour('4:00 PM')); // Should be 16

// Test slot generation
function generateTimeSlots(startTime, endTime) {
  const startHour = convertTo24Hour(startTime);
  const endHour = convertTo24Hour(endTime);
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  return slots;
}

console.log('\nTesting slot generation:');
console.log('Saturday 10:00 AM - 4:00 PM:', generateTimeSlots('10:00 AM', '4:00 PM'));
console.log('Monday 9:00 AM - 5:00 PM:', generateTimeSlots('9:00 AM', '5:00 PM'));
