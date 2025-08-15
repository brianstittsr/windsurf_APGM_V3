// Run this in the browser console on your booking page
// This will fix Victoria's Saturday availability directly

async function fixVictoriaSaturday() {
  console.log('🔧 Fixing Victoria\'s Saturday availability...');
  
  try {
    // Import the availability service (this works in the browser context)
    const { AvailabilityService } = await import('./src/services/availabilityService.js');
    
    const artistId = 'victoria';
    const dayOfWeek = 'saturday';
    
    // Get current availability to see what's wrong
    const currentAvailability = await AvailabilityService.getArtistAvailability(artistId);
    const saturdayData = currentAvailability.find(a => a.dayOfWeek === 'saturday');
    
    console.log('🔍 Current Saturday data:', saturdayData);
    
    // Clear existing time ranges
    if (saturdayData && saturdayData.timeRanges.length > 0) {
      for (const timeRange of saturdayData.timeRanges) {
        await AvailabilityService.removeTimeRange(artistId, dayOfWeek, timeRange.id);
        console.log('🗑️ Removed time range:', timeRange.startTime, '-', timeRange.endTime);
      }
    }
    
    // Add the correct single time range: 10:00 AM - 4:00 PM
    await AvailabilityService.addTimeRange(artistId, dayOfWeek, {
      startTime: '10:00 AM',
      endTime: '4:00 PM',
      isActive: true
    });
    console.log('✅ Added correct Saturday time range: 10:00 AM - 4:00 PM');
    
    // Enable Saturday if it's not enabled
    if (!saturdayData || !saturdayData.isEnabled) {
      await AvailabilityService.toggleDayAvailability(artistId, dayOfWeek, true);
      console.log('✅ Enabled Saturday');
    }
    
    // Verify the fix
    const updatedAvailability = await AvailabilityService.getArtistAvailability(artistId);
    const updatedSaturdayData = updatedAvailability.find(a => a.dayOfWeek === 'saturday');
    
    console.log('🎉 Saturday availability fixed!');
    console.log('📅 New Saturday schedule:', {
      isEnabled: updatedSaturdayData.isEnabled,
      timeRanges: updatedSaturdayData.timeRanges.map(tr => `${tr.startTime} - ${tr.endTime}`)
    });
    
    console.log('🔄 Refresh the page to see the changes');
    
  } catch (error) {
    console.error('❌ Error fixing Saturday availability:', error);
  }
}

// Run the fix
fixVictoriaSaturday();
