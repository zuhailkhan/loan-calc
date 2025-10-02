import React from 'react';
import type { LoanScheduleData, LoanConfig } from '../types/loan';

interface LoanSummaryCardsProps {
  config: LoanConfig;
  schedule: LoanScheduleData;
  formatCurrency: (amount: number) => string;
}

const LoanSummaryCards: React.FC<LoanSummaryCardsProps> = ({ config, schedule, formatCurrency }) => {
  const loanClearedMonth = schedule.data.length;
  const monthsSaved = config.months - loanClearedMonth;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Loan Amount</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(config.principal)}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Interest Rate</p>
          <p className="text-2xl font-bold text-green-700">{config.annualRate}% p.a.</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Monthly EMI</p>
          <p className="text-2xl font-bold text-purple-700">{formatCurrency(config.emi)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Interest</p>
          <p className="text-xl font-bold text-orange-700">{formatCurrency(schedule.totalInterest)}</p>
        </div>
        <div className="bg-teal-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Prepayment</p>
          <p className="text-xl font-bold text-teal-700">{formatCurrency(schedule.totalPrepayment)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Prepayment Fees ({config.prepaymentFeeRate}%)</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(schedule.totalPrepaymentFees)}</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Loan Cleared In</p>
          <p className="text-xl font-bold text-indigo-700">{loanClearedMonth} months</p>
        </div>
        <div className="bg-pink-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Time Saved</p>
          <p className="text-xl font-bold text-pink-700">{monthsSaved} months</p>
        </div>
      </div>
    </>
  );
};

export default LoanSummaryCards;
