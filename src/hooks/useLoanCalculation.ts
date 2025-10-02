import { useMemo } from 'react';
import type { LoanConfig, LoanScheduleData, ScheduleRow } from '../types/loan';

export const useLoanCalculation = (config: LoanConfig): LoanScheduleData => {
  return useMemo(() => {
    const { principal, annualRate, months, emi, prepaymentFeeRate, prepayments } = config;
    let balance = principal;
    const data: ScheduleRow[] = [];
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalPrepayment = 0;
    let totalPrepaymentFees = 0;

    const monthlyRate = annualRate / 12 / 100;
    const prepaymentFeeDecimal = prepaymentFeeRate / 100;

    const startDate = new Date();
    startDate.setDate(5);
    if (startDate.getDate() !== 5) {
      startDate.setMonth(startDate.getMonth() + 1);
      startDate.setDate(5);
    }

    for (let month = 1; month <= months; month++) {
      if (balance <= 0) break;

      const interest = balance * monthlyRate;
      const principalPaid = Math.min(emi - interest, balance);
      const prepayment = prepayments[month] || 0;
      const prepaymentFee = prepayment * prepaymentFeeDecimal;
      const totalPaid = principalPaid + prepayment;
      
      balance = Math.max(0, balance - totalPaid);
      totalInterest += interest;
      totalPrincipal += principalPaid;
      totalPrepayment += prepayment;
      totalPrepaymentFees += prepaymentFee;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + month - 1);

      data.push({
        month,
        dueDate: dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        emi,
        interest,
        principal: principalPaid,
        prepayment,
        prepaymentFee,
        totalPayment: emi + prepayment + prepaymentFee,
        balance
      });

      if (balance === 0) break;
    }

    return { data, totalInterest, totalPrincipal, totalPrepayment, totalPrepaymentFees };
  }, [config]);
};