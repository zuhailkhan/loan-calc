export interface LoanConfig {
  principal: number;
  annualRate: number;
  months: number;
  emi: number;
  prepaymentFeeRate: number;
  prepayments: Record<number, number>;
}

export interface ScheduleRow {
  month: number;
  dueDate: string;
  emi: number;
  interest: number;
  principal: number;
  prepayment: number;
  prepaymentFee: number;
  totalPayment: number;
  balance: number;
}

export interface LoanScheduleData {
  data: ScheduleRow[];
  totalInterest: number;
  totalPrincipal: number;
  totalPrepayment: number;
  totalPrepaymentFees: number;
}

export const DEFAULT_LOAN_CONFIG: Omit<LoanConfig, 'prepayments'> = {
  principal: 3500000,
  annualRate: 10.5,
  months: 84,
  emi: 59018,
  prepaymentFeeRate: 3.5,
};

export const DEFAULT_PREPAYMENT_AMOUNT = 41000;

// Firestore document structure
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
  prepayments: Record<string, number>; // Firestore uses string keys
  createdAt: unknown; // Firestore Timestamp
  updatedAt: unknown; // Firestore Timestamp
}