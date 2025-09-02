import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration - using hardcoded values for script execution
const firebaseConfig = {
  apiKey: "AIzaSyDvF4R7vEQQQQQQQQQQQQQQQQQQQQQQQQQ",
  authDomain: "aprettygirlmatterllc.firebaseapp.com",
  projectId: "aprettygirlmatterllc",
  storageBucket: "aprettygirlmatterllc.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop123456",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeBusinessSettings() {
  try {
    console.log('🏢 Initializing business settings...');
    
    // Check if settings already exist
    const settingsRef = collection(db, 'businessSettings');
    const existingSettings = await getDocs(settingsRef);
    
    if (existingSettings.size > 0) {
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await addDoc(settingsRef, defaultSettings);
    
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
initializeBusinessSettings();
