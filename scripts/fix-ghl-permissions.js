// Script to ensure proper GHL settings and permissions
// Run this in your browser console while logged in as admin

(async function() {
  try {
    console.log('🔧 Starting GHL permissions fix...');
    
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase not found. Run this on your website after Firebase loads.');
      return;
    }
    
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No user logged in. Please log in as admin first.');
      return;
    }
    
    console.log(`🔑 Logged in as: ${user.email}`);
    
    // Create/update the crmSettings/gohighlevel document with test values if missing
    const ghlDocRef = db.collection('crmSettings').doc('gohighlevel');
    
    // Check if document exists
    const ghlDoc = await ghlDocRef.get();
    
    if (!ghlDoc.exists) {
      console.log('⚠️ GHL settings document not found. Creating placeholder...');
      
      // Create placeholder document with empty values
      await ghlDocRef.set({
        apiKey: '',
        locationId: '',
        lastUpdated: new Date(),
        updatedBy: user.email
      });
      
      console.log('✅ Created placeholder GHL settings document');
    } else {
      console.log('✅ GHL settings document exists');
      
      // Optional: Log current values (careful with API keys)
      const data = ghlDoc.data();
      console.log(`   Location ID: ${data.locationId ? data.locationId.substring(0, 3) + '...' : 'Not set'}`);
      console.log(`   API Key: ${data.apiKey ? '********' : 'Not set'}`);
    }
    
    // Check if you can read the document
    try {
      const testRead = await db.collection('crmSettings').doc('gohighlevel').get();
      console.log('✅ Successfully read GHL settings');
    } catch (error) {
      console.error('❌ Cannot read GHL settings:', error);
    }
    
    console.log('🔍 Fix complete. If you still see GHL permission errors, please update your Firestore security rules.');
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  }
})();
