import { Timestamp } from 'firebase/firestore';

// Core loan configuration interface
export interface LoanConfig {
  principal: number;
  annualRate: number;
  months: number;
  emi: number;
  prepaymentFeeRate: number;
  prepayments: Record<number, number>;
}

// Firestore document structure for user configurations
export interface UserConfigDocument {
  userId: string;
  loanConfig: {
    principal: number;
    annualRate: number;
    months: number;
    emi: number;
    prepaymentFeeRate: number;
    defaultPrepayment: number;
  };
  prepayments: Record<string, number>; // month -> amount mapping (Firestore keys must be strings)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Loan schedule data for table display
export interface ScheduleRow {
  month: number;
  date: string;
  emi: number;
  interest: number;
  principal: number;
  prepayment: number;
  prepaymentFee: number;
  balance: number;
  totalPaid: number;
}

export interface LoanScheduleData {
  data: ScheduleRow[];
  totalInterest: number;
  totalPrincipal: number;
  totalPrepayment: number;
  totalPrepaymentFees: number;
}

// Default loan configuration constants
export const DEFAULT_LOAN_CONFIG: LoanConfig = {
  principal: 3500000,
  annualRate: 10.5,
  months: 84,
  emi: 59018,
  prepaymentFeeRate: 3.5,
  prepayments: {} // Will be populated with default values
};

export const DEFAULT_PREPAYMENT_AMOUNT = 41000;