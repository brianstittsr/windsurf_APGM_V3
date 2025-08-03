/**
 * Stripe Fee Calculator
 * Calculates Stripe processing fees for transactions
 */

// Stripe standard rates (as of 2024)
const STRIPE_PERCENTAGE_FEE = 0.029; // 2.9%
const STRIPE_FIXED_FEE = 0.30; // $0.30

export interface StripeFeeCalculation {
  subtotal: number;
  tax: number;
  deposit: number;
  stripeFee: number;
  total: number;
  remaining: number;
}

/**
 * Calculate Stripe processing fee
 * @param amount Amount in dollars
 * @returns Fee in dollars
 */
export function calculateStripeFee(amount: number): number {
  const fee = (amount * STRIPE_PERCENTAGE_FEE) + STRIPE_FIXED_FEE;
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate total with Stripe fees included
 * @param servicePrice Service price in dollars
 * @param taxRate Tax rate (e.g., 0.0775 for 7.75%)
 * @param depositAmount Fixed deposit amount in dollars
 * @returns Complete fee calculation breakdown
 */
export function calculateTotalWithStripeFees(
  servicePrice: number,
  taxRate: number = 0.0775,
  depositAmount: number = 200
): StripeFeeCalculation {
  // Base calculations
  const subtotal = servicePrice;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const deposit = depositAmount;
  
  // Calculate Stripe fee on the deposit amount
  const stripeFee = calculateStripeFee(deposit);
  
  // Total includes service price, tax, and Stripe fee
  const total = subtotal + tax + stripeFee;
  
  // Remaining balance (service + tax - deposit)
  const remaining = subtotal + tax - deposit;
  
  return {
    subtotal,
    tax,
    deposit,
    stripeFee,
    total,
    remaining: Math.max(0, remaining) // Ensure remaining is never negative
  };
}

/**
 * Format currency for display
 * @param amount Amount in dollars
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Get Stripe fee explanation text
 * @returns Explanation of Stripe fees
 */
export function getStripeFeeExplanation(): string {
  return `Processing fee (${(STRIPE_PERCENTAGE_FEE * 100).toFixed(1)}% + $${STRIPE_FIXED_FEE.toFixed(2)})`;
}
