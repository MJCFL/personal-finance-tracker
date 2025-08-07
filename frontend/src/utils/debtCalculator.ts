/**
 * Utility functions for debt-related calculations
 */

/**
 * Calculate the number of months needed to pay off a debt
 * @param principal The current balance of the debt
 * @param interestRate Annual interest rate as a percentage (e.g., 5.5 for 5.5%)
 * @param monthlyPayment Monthly payment amount
 * @returns Number of months to pay off the debt, or Infinity if payment is too small
 */
export function calculatePayoffMonths(
  principal: number,
  interestRate: number,
  monthlyPayment: number
): number {
  // Convert annual interest rate to monthly decimal
  const monthlyRate = interestRate / 100 / 12;
  
  // If monthly payment is less than or equal to monthly interest, debt will never be paid off
  const monthlyInterest = principal * monthlyRate;
  if (monthlyPayment <= monthlyInterest) {
    return Infinity;
  }
  
  // Formula: n = -log(1 - (P*r)/M) / log(1 + r)
  // Where: n = number of months, P = principal, r = monthly interest rate, M = monthly payment
  const months = -Math.log(1 - (principal * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
  
  return Math.ceil(months);
}

/**
 * Calculate the total interest paid over the life of the loan
 * @param principal The current balance of the debt
 * @param interestRate Annual interest rate as a percentage
 * @param monthlyPayment Monthly payment amount
 * @returns Total interest paid over the life of the loan, or Infinity if payment is too small
 */
export function calculateTotalInterest(
  principal: number,
  interestRate: number,
  monthlyPayment: number
): number {
  const months = calculatePayoffMonths(principal, interestRate, monthlyPayment);
  
  if (months === Infinity) {
    return Infinity;
  }
  
  // Total payment = monthly payment * number of months
  const totalPayment = monthlyPayment * months;
  
  // Total interest = total payment - principal
  return totalPayment - principal;
}

/**
 * Format a number of months into a human-readable duration string
 * @param months Number of months
 * @returns Formatted string (e.g., "2 years, 3 months")
 */
export function formatPayoffTime(months: number): string {
  if (months === Infinity) {
    return "Never (payment too small)";
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
}

/**
 * Calculate the minimum payment needed to pay off a debt in a given number of months
 * @param principal The current balance of the debt
 * @param interestRate Annual interest rate as a percentage
 * @param months Number of months to pay off the debt
 * @returns Monthly payment amount needed
 */
export function calculateRequiredPayment(
  principal: number,
  interestRate: number,
  months: number
): number {
  // Convert annual interest rate to monthly decimal
  const monthlyRate = interestRate / 100 / 12;
  
  // Formula: M = P * r * (1 + r)^n / ((1 + r)^n - 1)
  // Where: M = monthly payment, P = principal, r = monthly interest rate, n = number of months
  const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  
  return payment;
}
