import { getDb } from '../lib/firebase';

async function testDirectFirebase() {
  console.log('🔥 Testing direct Firebase connection...');
  
  try {
    const db = getDb();
    console.log('✅ Firebase initialized successfully');
    
    // Test reading users collection
    const usersSnapshot = await db.collection('users').limit(3).get();
    console.log(`✅ Successfully read ${usersSnapshot.size} users`);
    
    // Test querying for clients
    const clientsQuery = await db.collection('users').where('role', '==', 'client').limit(3).get();
    console.log(`✅ Found ${clientsQuery.size} client users`);
    
    if (clientsQuery.size > 0) {
      const firstClient = clientsQuery.docs[0].data();
      console.log(`✅ Sample client: ${firstClient.profile?.firstName || 'N/A'} ${firstClient.profile?.lastName || 'N/A'}`);
    }
    
    console.log('🎉 Firebase connection test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}

testDirectFirebase();
