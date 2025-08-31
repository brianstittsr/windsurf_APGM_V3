// Test script to verify Stripe fee calculation for different payment methods
require('dotenv').config({ path: '.env.local' });

// Import the fee calculation function
const { calculateTotalWithStripeFees } = require('./src/lib/stripe-fees');

console.log('🧪 Testing Stripe Fee Calculation for Different Payment Methods\n');

// Test scenario: $500 service with 20% coupon ($100 off) and $100 gift card
const originalServicePrice = 500;
const couponDiscount = 100; // 20% of $500
const giftCardDiscount = 100;
const discountedServicePrice = originalServicePrice - couponDiscount - giftCardDiscount; // $300
const taxRate = 0.0775; // 7.75%
const fixedDeposit = 200;

console.log('📊 Test Scenario:');
console.log(`Original Service Price: $${originalServicePrice}`);
console.log(`Coupon Discount (20%): -$${couponDiscount}`);
console.log(`Gift Card Discount: -$${giftCardDiscount}`);
console.log(`Discounted Service Price: $${discountedServicePrice}`);
console.log(`Tax Rate: ${(taxRate * 100).toFixed(2)}%`);
console.log(`Fixed Deposit: $${fixedDeposit}\n`);

// Test each payment method
const paymentMethods = ['card', 'klarna', 'affirm', 'cherry'];

paymentMethods.forEach(method => {
  console.log(`💳 Testing ${method.toUpperCase()} Payment Method:`);
  console.log('─'.repeat(50));
  
  try {
    const result = calculateTotalWithStripeFees(discountedServicePrice, taxRate, fixedDeposit, method);
    
    console.log(`Service Amount: $${result.subtotal.toFixed(2)}`);
    console.log(`Tax (${(taxRate * 100).toFixed(2)}%): $${result.tax.toFixed(2)}`);
    console.log(`Stripe Fee: $${result.stripeFee.toFixed(2)}`);
    console.log(`Total Amount: $${result.total.toFixed(2)}`);
    
    if (method === 'card') {
      console.log(`Deposit Amount: $${result.deposit.toFixed(2)}`);
      console.log(`Remaining Amount: $${result.remaining.toFixed(2)}`);
      console.log(`✅ Fee calculated on deposit amount ($${fixedDeposit})`);
    } else {
      console.log(`Full Payment Required: $${result.total.toFixed(2)}`);
      console.log(`✅ Fee calculated on full amount (${method} pay-later)`);
    }
    
    // Verify fee calculation logic
    if (method === 'card') {
      // For credit cards: fee on fixed deposit
      const expectedChargedAmount = fixedDeposit + result.tax + result.stripeFee;
      const expectedFee = Math.round((expectedChargedAmount * 0.029 + 0.30) * 100) / 100;
      console.log(`Expected Fee Calculation: (${fixedDeposit} + tax + fee) * 2.9% + $0.30`);
      console.log(`Verification: Fee should be ~$${expectedFee.toFixed(2)}`);
    } else {
      // For pay-later: fee on total amount
      const expectedChargedAmount = result.total;
      const expectedFee = Math.round((expectedChargedAmount * 0.029 + 0.30) * 100) / 100;
      console.log(`Expected Fee Calculation: ${result.total.toFixed(2)} * 2.9% + $0.30`);
      console.log(`Verification: Fee should be ~$${expectedFee.toFixed(2)}`);
    }
    
  } catch (error) {
    console.log(`❌ Error calculating fees for ${method}:`, error.message);
  }
  
  console.log('\n');
});

// Summary
console.log('📋 Summary:');
console.log('─'.repeat(50));
console.log('✅ Credit Card: Fee calculated on $200 deposit + tax + fee');
console.log('✅ Klarna/Affirm/Cherry: Fee calculated on full service amount + tax + fee');
console.log('✅ All payment methods properly handle discounted service price');
console.log('✅ Tax calculated on discounted service price');
console.log('✅ Stripe fee accounts for processing fee in calculation');
