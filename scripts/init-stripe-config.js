/**
 * Initialize Stripe configuration in Firestore
 * Run this script once to set up the systemConfig collection
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '../firebase-service-account.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

async function initializeStripeConfig() {
  try {
    console.log('🔧 Initializing Stripe configuration in Firestore...');
    
    // Get current environment mode as default
    const defaultMode = process.env.STRIPE_MODE?.toLowerCase() === 'live' ? 'live' : 'test';
    
    const configRef = db.collection('systemConfig').doc('stripe');
    
    // Check if config already exists
    const existingConfig = await configRef.get();
    
    if (existingConfig.exists) {
      console.log('⚠️  Stripe configuration already exists:');
      console.log('   Current mode:', existingConfig.data().mode);
      console.log('   Created at:', existingConfig.data().createdAt?.toDate());
      console.log('   Updated at:', existingConfig.data().updatedAt?.toDate());
      
      const shouldUpdate = process.argv.includes('--force');
      if (!shouldUpdate) {
        console.log('   Use --force flag to overwrite existing configuration');
        return;
      }
    }
    
    // Create or update the configuration
    const configData = {
      mode: defaultMode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'system-init',
      description: `Initialized with ${defaultMode} mode from environment variables`
    };
    
    await configRef.set(configData, { merge: true });
    
    console.log('✅ Stripe configuration initialized successfully!');
    console.log(`   Default mode: ${defaultMode.toUpperCase()}`);
    console.log('   Document path: systemConfig/stripe');
    
    // Verify the configuration
    const verifyConfig = await configRef.get();
    if (verifyConfig.exists) {
      console.log('✅ Configuration verified in database');
    } else {
      console.log('❌ Failed to verify configuration');
    }
    
  } catch (error) {
    console.error('❌ Error initializing Stripe configuration:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeStripeConfig()
  .then(() => {
    console.log('🎉 Initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Initialization failed:', error);
    process.exit(1);
  });
