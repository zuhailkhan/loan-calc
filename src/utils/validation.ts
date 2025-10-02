import type { LoanConfig } from '../types/loan';

/**
 * Validate loan configuration data
 */
export const validateLoanConfig = (config: Partial<LoanConfig>): string[] => {
  const errors: string[] = [];

  if (!config.principal || config.principal <= 0) {
    errors.push('Principal amount must be greater than 0');
  }

  if (!config.annualRate || config.annualRate <= 0 || config.annualRate > 100) {
    errors.push('Annual interest rate must be between 0 and 100');
  }

  if (!config.months || config.months <= 0 || config.months > 600) {
    errors.push('Loan term must be between 1 and 600 months');
  }

  if (!config.emi || config.emi <= 0) {
    errors.push('EMI amount must be greater than 0');
  }

  if (config.prepaymentFeeRate !== undefined && (config.prepaymentFeeRate < 0 || config.prepaymentFeeRate > 100)) {
    errors.push('Prepayment fee rate must be between 0 and 100');
  }

  return errors;
};

/**
 * Validate user ID
 */
export const validateUserId = (userId: string): boolean => {
  return typeof userId === 'string' && userId.length > 0 && userId.trim().length > 0;
};

/**
 * Sanitize prepayment amounts
 */
export const sanitizePrepayments = (prepayments: Record<number, number>): Record<number, number> => {
  const sanitized: Record<number, number> = {};
  
  Object.entries(prepayments).forEach(([month, amount]) => {
    const monthNum = parseInt(month, 10);
    const amountNum = Number(amount);
    
    if (!isNaN(monthNum) && !isNaN(amountNum) && monthNum > 0 && amountNum >= 0) {
      sanitized[monthNum] = Math.max(0, amountNum);
    }
  });
  
  return sanitized;
};