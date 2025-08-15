import { AvailabilityService } from '@/services/availabilityService';

async function fixVictoriaSaturday() {
  console.log('🔧 Fixing Victoria\'s Saturday availability...');
  
  try {
    const artistId = 'victoria';
    const dayOfWeek = 'saturday';
    
    // First, toggle the day off to clear any existing data
    await AvailabilityService.toggleDayAvailability(artistId, dayOfWeek, false);
    console.log('✅ Cleared existing Saturday data');
    
    // Then toggle it back on
    await AvailabilityService.toggleDayAvailability(artistId, dayOfWeek, true);
    console.log('✅ Enabled Saturday');
    
    // Add the correct time range: 10:00 AM - 4:00 PM
    await AvailabilityService.addTimeRange(artistId, dayOfWeek, {
      startTime: '10:00 AM',
      endTime: '4:00 PM',
      isActive: true
    });
    console.log('✅ Added Saturday time range: 10:00 AM - 4:00 PM');
    
    // Verify the fix
    const availability = await AvailabilityService.getArtistAvailability(artistId);
    const saturdayData = availability.find(a => a.dayOfWeek === 'saturday');
    
    if (saturdayData) {
      console.log('🎉 Saturday availability fixed!');
      console.log('📅 Saturday schedule:', {
        isEnabled: saturdayData.isEnabled,
        timeRanges: saturdayData.timeRanges.map(tr => `${tr.startTime} - ${tr.endTime}`)
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing Saturday availability:', error);
  }
}

// Export for use in other scripts
export { fixVictoriaSaturday };

// Run if called directly
if (require.main === module) {
  fixVictoriaSaturday()
    .then(() => {
      console.log('🔄 Please refresh your booking page to see the changes');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
