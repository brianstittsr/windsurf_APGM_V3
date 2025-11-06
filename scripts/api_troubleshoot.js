// Script to help troubleshoot API 500 errors
// Run this in your browser console while logged in as admin

(async function() {
  try {
    console.log('🔍 Starting API diagnostics...');
    
    // Check if user is logged in with Firebase
    if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
      console.error('❌ No user logged in. Please log in first.');
      return;
    }
    
    const user = firebase.auth().currentUser;
    console.log(`🔑 Logged in as: ${user.email}`);
    
    // Get an ID token for authentication
    const idToken = await user.getIdToken();
    console.log('✅ ID token obtained');
    
    // Test the API endpoint with proper auth
    console.log('🔄 Testing API endpoint...');
    
    try {
      const response = await fetch('/api/users/manage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection successful!');
        console.log(data);
      } else {
        const errorText = await response.text();
        console.error(`❌ API error (${response.status}):`, errorText);
        
        // Additional troubleshooting info
        console.log('🔍 Troubleshooting steps:');
        console.log('1. Check server logs for detailed error');
        console.log('2. Verify server environment variables are set');
        console.log('3. Check Firebase Admin SDK initialization in API route');
      }
    } catch (error) {
      console.error('❌ API connection failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error during diagnostics:', error);
  }
})();
