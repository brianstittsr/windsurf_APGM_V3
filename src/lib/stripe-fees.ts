/**
 * Stripe Fee Calculator
 * Calculates Stripe processing fees for transactions
 */

import { BusinessSettingsService } from '@/services/businessSettingsService';

// Processing fees by payment method
const STRIPE_PERCENTAGE_FEE = 0.029; // 2.9%
const STRIPE_FIXED_FEE = 0.30; // $0.30
const CHERRY_PERCENTAGE_FEE = 0.019; // 1.90%
const CHERRY_FIXED_FEE = 0; // No fixed fee for Cherry

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
 * Calculate total with processing fees included
 * @param servicePrice Service price in dollars (after discounts applied)
 * @param taxRate Tax rate (e.g., 0.0775 for 7.75%)
 * @param depositAmount Deposit amount in dollars (will be calculated from settings if not provided)
 * @param paymentMethod Payment method type ('card' | 'affirm' | 'klarna' | 'cherry')
 * @param depositReduction Amount to subtract from deposit (in dollars)
 * @returns Complete fee calculation breakdown
 */
export async function calculateTotalWithStripeFees(
  servicePrice: number,
  taxRate?: number,
  depositAmount?: number,
  paymentMethod: string = 'card',
  depositReduction: number = 0
): Promise<StripeFeeCalculation> {
  // Get business settings if not provided
  const settings = await BusinessSettingsService.getSettings();
  const finalTaxRate = taxRate ?? (settings.taxRate / 100);
  const depositEnabled = settings.depositEnabled ?? false;
  const finalDepositAmount = depositAmount ?? await BusinessSettingsService.calculateDepositAmount(servicePrice);
  
  // Base calculations - servicePrice should already have discounts applied
  const subtotal = servicePrice;
  const tax = Math.round(subtotal * finalTaxRate * 100) / 100;
  
  // Determine if this is a pay-later method that requires full payment upfront
  const isPayLater = ['affirm', 'klarna', 'cherry'].includes(paymentMethod.toLowerCase());
  const isCherry = paymentMethod.toLowerCase() === 'cherry';
  const isCreditCard = paymentMethod.toLowerCase() === 'card';
  
  // Deposits only allowed if: enabled in settings AND using credit card
  // If deposits disabled, require full payment
  const requiresFullPayment = !isCreditCard || !depositEnabled;
  let deposit = requiresFullPayment ? subtotal + tax : finalDepositAmount;
  
  // Apply deposit reduction if applicable (only for credit cards)
  if (isCreditCard && depositReduction > 0) {
    deposit = Math.max(0, deposit - depositReduction);
  }
  
  let stripeFee: number;
  
  if (isPayLater || requiresFullPayment) {
    // For pay-later methods or non-credit card payments, calculate fee on full service amount + tax
    const fullAmount = subtotal + tax;
    
    if (isCherry) {
      // Cherry uses 1.90% with no fixed fee
      stripeFee = Math.round(fullAmount * CHERRY_PERCENTAGE_FEE * 100) / 100;
    } else {
      // Affirm and Klarna use Stripe fees
      const chargedAmount = (fullAmount + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);
      stripeFee = Math.round((chargedAmount - fullAmount) * 100) / 100;
    }
  } else {
    // For credit cards with deposit, calculate fee on deposit amount only
    const chargedAmount = (deposit + STRIPE_FIXED_FEE) / (1 - STRIPE_PERCENTAGE_FEE);
    stripeFee = Math.round((chargedAmount - deposit) * 100) / 100;
  }
  
  // Total includes discounted service price, tax, and processing fee
  const total = subtotal + tax + stripeFee;
  
  // Remaining balance (discounted service + tax - deposit)
  // For pay-later methods or non-credit cards, remaining is 0 since full amount is paid upfront
  const remaining = (isPayLater || requiresFullPayment) ? 0 : Math.max(0, subtotal + tax - deposit);
  
  return {
    subtotal,
    tax,
    deposit: (isPayLater || requiresFullPayment) ? subtotal + tax : deposit, // Pay-later methods or non-credit cards charge full amount
    stripeFee,
    total,
    remaining
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
 * Get processing fee explanation text based on payment method
 * @param paymentMethod Payment method type
 * @returns Explanation of processing fees
 */
export function getStripeFeeExplanation(paymentMethod: string = 'card'): string {
  const isCherry = paymentMethod.toLowerCase() === 'cherry';
  
  if (isCherry) {
    return `Cherry processing fee (${(CHERRY_PERCENTAGE_FEE * 100).toFixed(1)}%)`;
  } else {
    return `Processing fee (${(STRIPE_PERCENTAGE_FEE * 100).toFixed(1)}% + $${STRIPE_FIXED_FEE.toFixed(2)})`;
  }
}
