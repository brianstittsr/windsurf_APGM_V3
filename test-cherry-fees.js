/**
 * Test script to verify Cherry payment processing fee calculation
 */

// Import the fee calculation functions
const { calculateTotalWithStripeFees, getStripeFeeExplanation, formatCurrency } = require('./src/lib/stripe-fees.ts');

console.log('=== Cherry Payment Fee Calculation Test ===\n');

// Test scenario: $500 service with $200 discount = $300 final price
const servicePrice = 300; // After discount
const taxRate = 0.0775; // 7.75%
const depositAmount = 200;

console.log('Test Scenario:');
console.log(`Service Price (after discount): ${formatCurrency(servicePrice)}`);
console.log(`Tax Rate: ${(taxRate * 100).toFixed(2)}%`);
console.log(`Fixed Deposit: ${formatCurrency(depositAmount)}\n`);

// Test different payment methods
const paymentMethods = ['card', 'affirm', 'klarna', 'cherry'];

paymentMethods.forEach(method => {
  console.log(`--- ${method.toUpperCase()} Payment ---`);
  
  const calculation = calculateTotalWithStripeFees(servicePrice, taxRate, depositAmount, method);
  const explanation = getStripeFeeExplanation(method);
  
  console.log(`Subtotal: ${formatCurrency(calculation.subtotal)}`);
  console.log(`Tax: ${formatCurrency(calculation.tax)}`);
  console.log(`${explanation}: ${formatCurrency(calculation.stripeFee)}`);
  console.log(`Total: ${formatCurrency(calculation.total)}`);
  console.log(`Due Today: ${formatCurrency(calculation.deposit + calculation.stripeFee)}`);
  console.log(`Remaining: ${formatCurrency(calculation.remaining)}\n`);
});

// Specific Cherry vs Stripe comparison
console.log('=== Cherry vs Stripe Fee Comparison ===');
const cherryCalc = calculateTotalWithStripeFees(servicePrice, taxRate, depositAmount, 'cherry');
const stripeCalc = calculateTotalWithStripeFees(servicePrice, taxRate, depositAmount, 'affirm');

console.log(`Cherry Fee (1.90%): ${formatCurrency(cherryCalc.stripeFee)}`);
console.log(`Stripe Fee (2.9% + $0.30): ${formatCurrency(stripeCalc.stripeFee)}`);
console.log(`Savings with Cherry: ${formatCurrency(stripeCalc.stripeFee - cherryCalc.stripeFee)}`);
console.log(`Percentage Savings: ${(((stripeCalc.stripeFee - cherryCalc.stripeFee) / stripeCalc.stripeFee) * 100).toFixed(1)}%`);
