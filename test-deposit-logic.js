/**
 * Test script to verify the $200 deposit threshold logic
 */

// Import the sync fee calculation function
const { calculateTotalWithStripeFeesSync } = require('./src/lib/stripe-fees-sync.ts');

console.log('Testing $200 deposit threshold logic...\n');

// Test cases
const testCases = [
  {
    name: 'Service under $200 total (should require full payment)',
    servicePrice: 150,
    taxRate: 0.0775,
    expectedFullPayment: true
  },
  {
    name: 'Service at exactly $200 total (should allow deposit)',
    servicePrice: 185.76, // This should result in exactly $200 with tax
    taxRate: 0.0775,
    expectedFullPayment: false
  },
  {
    name: 'Service over $200 total (should allow deposit)',
    servicePrice: 300,
    taxRate: 0.0775,
    expectedFullPayment: false
  },
  {
    name: 'Service just under $200 with tax',
    servicePrice: 180,
    taxRate: 0.0775,
    expectedFullPayment: true
  }
];

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  
  const calculation = calculateTotalWithStripeFeesSync(
    testCase.servicePrice,
    testCase.taxRate,
    undefined, // Let it calculate deposit
    'card'
  );
  
  const totalWithTax = calculation.subtotal + calculation.tax;
  const isFullPayment = calculation.remaining === 0 && calculation.deposit === totalWithTax;
  
  console.log(`  Service Price: $${testCase.servicePrice.toFixed(2)}`);
  console.log(`  Tax: $${calculation.tax.toFixed(2)}`);
  console.log(`  Total with Tax: $${totalWithTax.toFixed(2)}`);
  console.log(`  Deposit Required: $${calculation.deposit.toFixed(2)}`);
  console.log(`  Remaining: $${calculation.remaining.toFixed(2)}`);
  console.log(`  Is Full Payment: ${isFullPayment}`);
  console.log(`  Expected Full Payment: ${testCase.expectedFullPayment}`);
  console.log(`  ✅ Test ${isFullPayment === testCase.expectedFullPayment ? 'PASSED' : 'FAILED'}\n`);
});
