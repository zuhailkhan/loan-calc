import { useState } from 'react';
import { useLoanCalculation } from '../hooks/useLoanCalculation';
import { exportLoanScheduleToCSV } from '../utils/csvExport';
import LoanSummaryCards from './LoanSummaryCards';
import PrepaymentControls from './PrepaymentControls';
import ScheduleTable from './ScheduleTable';
import type { LoanConfig } from '../types/loan';

const DEFAULT_PRINCIPAL = 10000000;
const DEFAULT_ANNUAL_RATE = 10.5;
const DEFAULT_MONTHS = 120;
const DEFAULT_EMI = 135000;
const DEFAULT_PREPAYMENT = 50000;
const DEFAULT_PREPAYMENT_FEE_RATE = 3.5;

const LoanCalculator = () => {
  const [prepayments, setPrepayments] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    for (let i = 1; i <= DEFAULT_MONTHS; i++) {
      initial[i] = DEFAULT_PREPAYMENT;
    }
    return initial;
  });

  const config: LoanConfig = {
    principal: DEFAULT_PRINCIPAL,
    annualRate: DEFAULT_ANNUAL_RATE,
    months: DEFAULT_MONTHS,
    emi: DEFAULT_EMI,
    prepaymentFeeRate: DEFAULT_PREPAYMENT_FEE_RATE,
    prepayments
  };

  const schedule = useLoanCalculation(config);

  const handlePrepaymentChange = (month: number, value: string) => {
    setPrepayments(prev => ({
      ...prev,
      [month]: value === '' ? 0 : parseFloat(value) || 0
    }));
  };

  const setAllPrepayments = (value: number) => {
    const newPrepayments: Record<number, number> = {};
    for (let i = 1; i <= DEFAULT_MONTHS; i++) {
      newPrepayments[i] = value;
    }
    setPrepayments(newPrepayments);
  };

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const handleDownloadCSV = () => {
    exportLoanScheduleToCSV(schedule, config);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Loan Repayment Calculator</h1>
        
        <LoanSummaryCards 
          config={config}
          schedule={schedule}
          formatCurrency={formatCurrency}
        />

        <PrepaymentControls
          defaultPrepayment={DEFAULT_PREPAYMENT}
          prepaymentFeeRate={DEFAULT_PREPAYMENT_FEE_RATE}
          onSetAllPrepayments={setAllPrepayments}
          onClearAllPrepayments={() => setAllPrepayments(0)}
          onDownloadCSV={handleDownloadCSV}
        />
      </div>

      <ScheduleTable
        schedule={schedule.data}
        prepayments={prepayments}
        totalInterest={schedule.totalInterest}
        totalPrincipal={schedule.totalPrincipal}
        totalPrepayment={schedule.totalPrepayment}
        totalPrepaymentFees={schedule.totalPrepaymentFees}
        formatCurrency={formatCurrency}
        onPrepaymentChange={handlePrepaymentChange}
      />
    </div>
  );
};

export default LoanCalculator;
