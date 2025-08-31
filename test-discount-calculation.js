// Test discount calculation logic
console.log('🧮 Testing discount calculation logic...\n');

// Mock service price
const servicePrice = 500; // $500 service
console.log(`Original service price: $${servicePrice}`);

// Mock coupon (20% off)
const mockCoupon = {
  code: 'OPENNOW',
  type: 'percentage',
  value: 20,
  description: 'Grand Opening Special - 20% Off'
};

// Mock gift card ($100)
const mockGiftCard = {
  code: 'GIFT100',
  remainingAmount: 10000 // $100 in cents
};

// Calculate coupon discount
function calculateCouponDiscount(coupon, orderAmount) {
  if (coupon.type === 'percentage' || coupon.type === 'free_service') {
    return Math.round((orderAmount * coupon.value / 100) * 100) / 100;
  } else {
    return Math.min(coupon.value, orderAmount);
  }
}

// Calculate gift card discount
function calculateGiftCardDiscount(giftCard, orderAmount) {
  const availableAmount = giftCard.remainingAmount / 100; // Convert cents to dollars
  return Math.min(availableAmount, orderAmount);
}

const couponDiscount = calculateCouponDiscount(mockCoupon, servicePrice);
const giftCardDiscount = calculateGiftCardDiscount(mockGiftCard, servicePrice);

console.log(`\n💳 Coupon discount (${mockCoupon.code}): $${couponDiscount}`);
console.log(`🎁 Gift card discount: $${giftCardDiscount}`);

const totalDiscounts = couponDiscount + giftCardDiscount;
const discountedServicePrice = Math.max(0, servicePrice - totalDiscounts);

console.log(`\n📊 Total discounts: $${totalDiscounts}`);
console.log(`💰 Discounted service price: $${discountedServicePrice}`);

// Tax calculation
const taxRate = 0.0775;
const tax = Math.round(discountedServicePrice * taxRate * 100) / 100;
console.log(`💸 Tax (7.75% on discounted price): $${tax}`);

// Stripe fee (calculated correctly as percentage of charged amount)
const depositAmount = 200;
const STRIPE_PERCENTAGE_FEE = 0.029; // 2.9%
const STRIPE_FIXED_FEE = 0.30; // $0.30

// Calculate the actual amount that will be charged (deposit + processing fee)
// We need to solve for: chargedAmount = deposit + (chargedAmount * 0.029 + 0.30)
// Rearranging: chargedAmount = (deposit + 0.30) / (1 - 0.029)
const chargedAmount = (depositAmount + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);
const stripeFee = Math.round((chargedAmount - depositAmount) * 100) / 100;
console.log(`🏦 Stripe fee (calculated on charged amount): $${stripeFee}`);

// Final totals
const totalAmount = discountedServicePrice + tax + stripeFee;
const remainingAmount = Math.max(0, discountedServicePrice + tax - depositAmount);

console.log(`\n🎯 FINAL CALCULATIONS:`);
console.log(`   Service (after discounts): $${discountedServicePrice}`);
console.log(`   Tax: $${tax}`);
console.log(`   Stripe fee: $${stripeFee}`);
console.log(`   ────────────────────────`);
console.log(`   Total amount: $${totalAmount}`);
console.log(`   Due today (deposit + fee): $${depositAmount + stripeFee}`);
console.log(`   Remaining balance: $${remainingAmount}`);

console.log(`\n✅ Expected savings: $${totalDiscounts} (${((totalDiscounts / servicePrice) * 100).toFixed(1)}% off original price)`);
