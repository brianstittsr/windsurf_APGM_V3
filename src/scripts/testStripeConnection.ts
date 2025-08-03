/**
 * Stripe Connection Test Script
 * Tests both test and production API keys to verify connectivity
 */

import Stripe from 'stripe';

interface TestResult {
  mode: 'test' | 'live';
  success: boolean;
  error?: string;
  accountInfo?: {
    id: string;
    country: string;
    defaultCurrency: string;
    email?: string;
    businessProfile?: {
      name?: string;
    };
  };
}

async function testStripeKey(secretKey: string, mode: 'test' | 'live'): Promise<TestResult> {
  try {
    console.log(`\n🔍 Testing ${mode.toUpperCase()} mode connection...`);
    
    // Validate key format
    const expectedPrefix = mode === 'test' ? 'sk_test_' : 'sk_live_';
    if (!secretKey.startsWith(expectedPrefix)) {
      return {
        mode,
        success: false,
        error: `Invalid key format. Expected ${expectedPrefix}* but got ${secretKey.substring(0, 10)}...`
      };
    }

    // Initialize Stripe with the key
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-07-30.basil',
    });

    // Test the connection by retrieving account information
    const account = await stripe.accounts.retrieve();
    
    console.log(`✅ ${mode.toUpperCase()} connection successful!`);
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Currency: ${account.default_currency}`);
    if (account.email) {
      console.log(`   Email: ${account.email}`);
    }
    if (account.business_profile?.name) {
      console.log(`   Business: ${account.business_profile.name}`);
    }

    return {
      mode,
      success: true,
      accountInfo: {
        id: account.id,
        country: account.country || 'Unknown',
        defaultCurrency: account.default_currency || 'Unknown',
        email: account.email || undefined,
        businessProfile: {
          name: account.business_profile?.name || undefined
        }
      }
    };

  } catch (error) {
    console.log(`❌ ${mode.toUpperCase()} connection failed!`);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.log(`   Error: ${errorMessage}`);
    }

    return {
      mode,
      success: false,
      error: errorMessage
    };
  }
}

async function testStripeConnections() {
  console.log('🚀 Starting Stripe API Connection Tests...\n');
  
  // Get keys from environment
  const testKey = process.env.STRIPE_TEST_SECRET_KEY;
  const liveKey = process.env.STRIPE_LIVE_SECRET_KEY;
  const currentMode = process.env.STRIPE_MODE || 'test';
  
  console.log(`📋 Current STRIPE_MODE: ${currentMode.toUpperCase()}`);
  
  const results: TestResult[] = [];
  
  // Test the test key if available
  if (testKey) {
    const testResult = await testStripeKey(testKey, 'test');
    results.push(testResult);
  } else {
    console.log('\n⚠️  STRIPE_TEST_SECRET_KEY not found in environment');
    results.push({
      mode: 'test',
      success: false,
      error: 'STRIPE_TEST_SECRET_KEY not found in environment variables'
    });
  }
  
  // Test the live key if available
  if (liveKey) {
    const liveResult = await testStripeKey(liveKey, 'live');
    results.push(liveResult);
  } else {
    console.log('\n⚠️  STRIPE_LIVE_SECRET_KEY not found in environment');
    results.push({
      mode: 'live',
      success: false,
      error: 'STRIPE_LIVE_SECRET_KEY not found in environment variables'
    });
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('=' * 50);
  
  results.forEach(result => {
    const status = result.success ? '✅ WORKING' : '❌ FAILED';
    console.log(`${result.mode.toUpperCase()} Mode: ${status}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    if (result.accountInfo) {
      console.log(`  Account: ${result.accountInfo.id}`);
      console.log(`  Country: ${result.accountInfo.country}`);
    }
  });
  
  const workingModes = results.filter(r => r.success).length;
  console.log(`\n🎯 ${workingModes}/${results.length} connections working`);
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (results.find(r => r.mode === 'test' && r.success)) {
    console.log('✅ Test mode is ready for development');
  } else {
    console.log('❌ Set up test keys for development');
  }
  
  if (results.find(r => r.mode === 'live' && r.success)) {
    console.log('✅ Live mode is ready for production');
  } else {
    console.log('⚠️  Live keys needed for production deployment');
  }
  
  return results;
}

// Run the test if this script is executed directly
if (require.main === module) {
  testStripeConnections()
    .then(() => {
      console.log('\n🏁 Test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed with error:', error);
      process.exit(1);
    });
}

export { testStripeConnections, testStripeKey };
export type { TestResult };
