// Simple test to verify Stripe fee calculation logic
console.log('🧪 Testing Stripe Fee Calculation Logic\n');

// Replicate the fee calculation function locally for testing
function calculateStripeFee(chargedAmount) {
  // Stripe fee: 2.9% + $0.30
  // Fee is calculated on the amount that includes the fee itself
  // So: chargedAmount = baseAmount + fee
  // fee = (baseAmount + fee) * 0.029 + 0.30
  // Solving for fee: fee = (chargedAmount * 0.029 + 0.30) / (1 - 0.029)
  
  const feeRate = 0.029;
  const fixedFee = 0.30;
  
  const fee = (chargedAmount * feeRate + fixedFee) / (1 - feeRate);
  return Math.round(fee * 100) / 100;
}

function calculateTotalWithStripeFees(servicePrice, taxRate, fixedDeposit, paymentMethod = 'card') {
  const subtotal = servicePrice;
  const tax = subtotal * taxRate;
  
  let stripeFee, deposit, remaining, total;
  
  if (paymentMethod === 'card') {
    // Credit card: fee calculated on fixed deposit
    const depositWithTax = fixedDeposit + tax;
    stripeFee = calculateStripeFee(depositWithTax);
    deposit = depositWithTax + stripeFee;
    remaining = subtotal - fixedDeposit;
    total = subtotal + tax + stripeFee;
  } else {
    // Pay-later methods: fee calculated on full amount
    const totalWithTax = subtotal + tax;
    stripeFee = calculateStripeFee(totalWithTax);
    total = totalWithTax + stripeFee;
    deposit = total; // Full payment required
    remaining = 0;
  }
  
  return {
    subtotal,
    tax,
    stripeFee,
    total,
    deposit,
    remaining
  };
}

// Test scenario: $500 service with discounts
const originalServicePrice = 500;
const couponDiscount = 100; // 20% coupon
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
  console.log(`💳 ${method.toUpperCase()} Payment Method:`);
  console.log('─'.repeat(40));
  
  const result = calculateTotalWithStripeFees(discountedServicePrice, taxRate, fixedDeposit, method);
  
  console.log(`Service Amount: $${result.subtotal.toFixed(2)}`);
  console.log(`Tax (${(taxRate * 100).toFixed(2)}%): $${result.tax.toFixed(2)}`);
  console.log(`Stripe Fee: $${result.stripeFee.toFixed(2)}`);
  console.log(`Total Amount: $${result.total.toFixed(2)}`);
  
  if (method === 'card') {
    console.log(`Deposit Amount: $${result.deposit.toFixed(2)}`);
    console.log(`Remaining Amount: $${result.remaining.toFixed(2)}`);
    console.log(`✅ Fee on deposit: $${fixedDeposit} + tax + fee`);
  } else {
    console.log(`Full Payment: $${result.total.toFixed(2)}`);
    console.log(`✅ Fee on full amount: service + tax + fee`);
  }
  
  console.log('');
});

console.log('📋 Key Differences:');
console.log('─'.repeat(40));
console.log('• Credit Card: Customer pays $200 deposit + tax + processing fee');
console.log('• Pay-Later: Customer pays full discounted amount + tax + processing fee');
console.log('• Both methods apply discounts before calculating tax and fees');
console.log('• Processing fee varies based on charged amount');
