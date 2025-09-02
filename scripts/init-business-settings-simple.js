// Simple business settings initialization using Firebase Admin SDK
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(__dirname, '..', 'aprettygirlmatterllc-3a30decf622e.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found at:', serviceAccountPath);
  console.log('💡 Please ensure aprettygirlmatterllc-3a30decf622e.json is in the project root');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'aprettygirlmatterllc'
  });
}

const db = admin.firestore();

async function initializeBusinessSettings() {
  try {
    console.log('🏢 Initializing business settings...');
    
    // Check if settings already exist
    const settingsRef = db.collection('businessSettings');
    const existingSettings = await settingsRef.get();
    
    if (!existingSettings.empty) {
      console.log('✅ Business settings already exist');
      const settings = existingSettings.docs[0].data();
      console.log('📊 Current settings:', {
        depositPercentage: settings.depositPercentage + '%',
        taxRate: settings.taxRate + '%',
        businessName: settings.businessName
      });
      return;
    }
    
    // Create default business settings
    const defaultSettings = {
      depositPercentage: 33.33, // 33.33% deposit (equivalent to $200 on $600 service)
      taxRate: 7.75, // 7.75% tax rate
      cancellationPolicy: '24 hours notice required',
      rebookingFee: 50,
      businessName: 'A Pretty Girl Matter',
      address: '',
      phone: '',
      email: '',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    await settingsRef.add(defaultSettings);
    
    console.log('✅ Business settings initialized successfully!');
    console.log('📊 Default settings created:', {
      depositPercentage: defaultSettings.depositPercentage + '%',
      taxRate: defaultSettings.taxRate + '%',
      businessName: defaultSettings.businessName,
      rebookingFee: '$' + defaultSettings.rebookingFee
    });
    
    console.log('\n💡 Next steps:');
    console.log('1. Go to Admin Dashboard → Business Settings');
    console.log('2. Customize deposit percentage, tax rate, and business info');
    console.log('3. Test booking flow to verify dynamic deposit calculation');
    
  } catch (error) {
    console.error('❌ Error initializing business settings:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeBusinessSettings().then(() => {
  console.log('🎉 Initialization complete!');
  process.exit(0);
});
