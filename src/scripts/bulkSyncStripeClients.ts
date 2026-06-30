import { stripeCustomerSyncService } from '../services/stripeCustomerSync';

async function bulkSyncStripeClients() {
  console.log('🚀 Starting bulk sync of clients to Stripe...');
  
  try {
    const result = await stripeCustomerSyncService.bulkSyncUsers();
    
    console.log('✅ Bulk sync completed!');
    console.log(`📊 Results:`);
    console.log(`   - Synced: ${result.synced} clients`);
    console.log(`   - Errors: ${result.errors} clients`);
    
    if (result.errors > 0) {
      console.log('⚠️ Some clients had sync errors. Check the logs for details.');
    }
    
    console.log('🎉 All done! Existing clients now have Stripe Customer IDs.');
    
  } catch (error) {
    console.error('❌ Bulk sync failed:', error);
    process.exit(1);
  }
}

// Run the bulk sync
bulkSyncStripeClients();
