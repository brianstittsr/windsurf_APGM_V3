/**
 * Verify Stripe setup and test payment intent creation
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function verifyStripeSetup() {
  console.log('🔧 Verifying Stripe Setup and Database Configuration\n');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Check/Set database Stripe mode
    console.log('📊 Checking database Stripe configuration...');
    const configRef = doc(db, 'systemConfig', 'stripe');
    let configDoc = await getDoc(configRef);
    
    if (!configDoc.exists()) {
      console.log('⚠️  Database config not found, creating live mode config...');
      await setDoc(configRef, {
        mode: 'live',
        updatedAt: new Date(),
        updatedBy: 'verify-script',
        description: 'Set to live mode for production'
      });
      configDoc = await getDoc(configRef);
    }
    
    const dbMode = configDoc.data().mode;
    console.log(`✅ Database Stripe mode: ${dbMode.toUpperCase()}`);
    
    // Get environment variables
    const envMode = process.env.STRIPE_MODE || 'test';
    const testSecret = process.env.STRIPE_TEST_SECRET_KEY;
    const liveSecret = process.env.STRIPE_LIVE_SECRET_KEY;
    
    console.log(`📋 Environment STRIPE_MODE: ${envMode.toUpperCase()}`);
    console.log(`🔑 Test key available: ${testSecret ? '✅ Yes' : '❌ No'}`);
    console.log(`🔑 Live key available: ${liveSecret ? '✅ Yes' : '❌ No'}`);
    
    // Use database mode (priority) or fallback to environment
    const activeMode = dbMode || envMode;
    const secretKey = activeMode === 'live' ? liveSecret : testSecret;
    
    if (!secretKey) {
      console.error(`❌ No ${activeMode} secret key found`);
      return;
    }
    
    console.log(`\n🚀 Testing Stripe API in ${activeMode.toUpperCase()} mode...`);
    
    // Test Stripe connection
    const stripe = new Stripe(secretKey);
    
    // Test 1: Account info
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe account connected');
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Charges enabled: ${account.charges_enabled}`);
    
    // Test 2: Create payment intent
    console.log('\n💳 Testing payment intent creation...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: 'usd',
      metadata: {
        test: 'verification_test',
        mode: activeMode
      }
    });
    
    console.log('✅ Payment intent created successfully!');
    console.log(`   ID: ${paymentIntent.id}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    
    // Test 3: Retrieve the payment intent
    console.log('\n🔍 Testing payment intent retrieval...');
    const retrieved = await stripe.paymentIntents.retrieve(paymentIntent.id);
    console.log('✅ Payment intent retrieved successfully!');
    console.log(`   Status: ${retrieved.status}`);
    
    console.log('\n🎉 All Stripe tests passed! Configuration is working correctly.');
    console.log(`\n📝 Summary:`);
    console.log(`   Database mode: ${dbMode}`);
    console.log(`   Active mode: ${activeMode}`);
    console.log(`   Test payment intent: ${paymentIntent.id}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    
    if (error.code === 'resource_missing') {
      console.error('   This is the same error you were experiencing - payment intent not found');
    } else if (error.type === 'StripeAuthenticationError') {
      console.error('   Invalid API key - check your environment variables');
    }
  }
}

verifyStripeSetup();
