/**
 * Simple test for Cherry payment processing fee calculation
 */

// Cherry fee constants
const STRIPE_PERCENTAGE_FEE = 0.029; // 2.9%
const STRIPE_FIXED_FEE = 0.30; // $0.30
const CHERRY_PERCENTAGE_FEE = 0.019; // 1.90%

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function calculateFees(servicePrice, taxRate = 0.0775) {
  const subtotal = servicePrice;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const fullAmount = subtotal + tax;
  
  // Cherry fee calculation (1.90% with no fixed fee)
  const cherryFee = Math.round(fullAmount * CHERRY_PERCENTAGE_FEE * 100) / 100;
  
  // Stripe fee calculation for comparison (2.9% + $0.30)
  const chargedAmount = (fullAmount + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);
  const stripeFee = Math.round((chargedAmount - fullAmount) * 100) / 100;
  
  return {
    subtotal,
    tax,
    fullAmount,
    cherryFee,
    stripeFee,
    savings: stripeFee - cherryFee
  };
}

console.log('=== Cherry vs Stripe Fee Comparison ===\n');

// Test scenario: $500 service with $200 discount = $300 final price
const servicePrice = 300;
const result = calculateFees(servicePrice);

console.log(`Service Price (after discount): ${formatCurrency(result.subtotal)}`);
console.log(`Tax (7.75%): ${formatCurrency(result.tax)}`);
console.log(`Full Amount: ${formatCurrency(result.fullAmount)}\n`);

console.log('--- Processing Fees ---');
console.log(`Cherry Fee (1.90%): ${formatCurrency(result.cherryFee)}`);
console.log(`Stripe Fee (2.9% + $0.30): ${formatCurrency(result.stripeFee)}`);
console.log(`Savings with Cherry: ${formatCurrency(result.savings)}`);
console.log(`Percentage Savings: ${((result.savings / result.stripeFee) * 100).toFixed(1)}%\n`);

console.log('--- Total Amounts ---');
console.log(`Cherry Total: ${formatCurrency(result.fullAmount + result.cherryFee)}`);
console.log(`Stripe Total: ${formatCurrency(result.fullAmount + result.stripeFee)}`);
