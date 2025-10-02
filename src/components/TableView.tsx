import React, { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import type { LoanScheduleData, LoanConfig } from '../types/loan';
import { exportLoanScheduleToCSV, ExportError } from '../utils/csvExport';

interface TableViewProps {
  schedule: LoanScheduleData;
  config: LoanConfig;
  onPrepaymentChange: (month: number, amount: number) => void;
}

const TableView: React.FC<TableViewProps> = ({
  schedule,
  config,
  onPrepaymentChange
}) => {
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const handlePrepaymentInputChange = (month: number, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value) || 0;
    onPrepaymentChange(month, numericValue);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      exportLoanScheduleToCSV(schedule, config, {
        filename: 'loan_repayment_schedule',
        includeTimestamp: true
      });
    } catch (error) {
      const errorMessage = error instanceof ExportError 
        ? error.message 
        : 'An unexpected error occurred while exporting. Please try again.';
      setExportError(errorMessage);
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const loanClearedMonth = schedule.data.length;
  const monthsSaved = config.months - loanClearedMonth;

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header with Summary Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Loan Schedule</h2>
          <button
            onClick={handleExport}
            disabled={isExporting || schedule.data.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Error Message */}
        {exportError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Export Failed</p>
              <p className="text-sm text-red-700 mt-1">{exportError}</p>
            </div>
            <button
              onClick={() => setExportError(null)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-orange-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Interest</p>
            <p className="text-lg font-bold text-orange-700">{formatCurrency(schedule.totalInterest)}</p>
          </div>
          <div className="bg-teal-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Prepayment</p>
            <p className="text-lg font-bold text-teal-700">{formatCurrency(schedule.totalPrepayment)}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Prepayment Fees</p>
            <p className="text-lg font-bold text-red-700">{formatCurrency(schedule.totalPrepaymentFees)}</p>
          </div>
          <div className="bg-indigo-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Loan Cleared In</p>
            <p className="text-lg font-bold text-indigo-700">{loanClearedMonth} months</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-pink-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Time Saved</p>
            <p className="text-lg font-bold text-pink-700">{monthsSaved} months</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount Paid</p>
            <p className="text-lg font-bold text-blue-700">
              {formatCurrency(schedule.data.reduce((sum, row) => sum + row.totalPayment, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-sm font-medium">Month</th>
                <th className="px-3 py-3 text-left text-sm font-medium">Due Date</th>
                <th className="px-3 py-3 text-right text-sm font-medium">EMI</th>
                <th className="px-3 py-3 text-right text-sm font-medium">Interest</th>
                <th className="px-3 py-3 text-right text-sm font-medium">Principal</th>
                <th className="px-3 py-3 text-right text-sm font-medium">Prepayment</th>
                <th className="px-3 py-3 text-right text-sm font-medium">Fee ({config.prepaymentFeeRate}%)</th>
                <th className="px-3 py-3 text-right text-sm font-medium">Total Payment</th>
                <th className="px-3 py-3 text-right text-sm font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.data.map((row, idx) => (
                <tr 
                  key={row.month} 
                  className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-3 py-3 font-medium text-sm">{row.month}</td>
                  <td className="px-3 py-3 text-sm">{row.dueDate}</td>
                  <td className="px-3 py-3 text-right text-sm">{formatCurrency(row.emi)}</td>
                  <td className="px-3 py-3 text-right text-sm text-red-600">{formatCurrency(row.interest)}</td>
                  <td className="px-3 py-3 text-right text-sm text-green-600">{formatCurrency(row.principal)}</td>
                  <td className="px-3 py-3 text-right">
                    <input
                      type="number"
                      value={config.prepayments[row.month] || 0}
                      onChange={(e) => handlePrepaymentInputChange(row.month, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="1000"
                    />
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-orange-600">{formatCurrency(row.prepaymentFee)}</td>
                  <td className="px-3 py-3 text-right text-sm font-semibold">{formatCurrency(row.totalPayment)}</td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-blue-700">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold sticky bottom-0">
              <tr>
                <td colSpan={2} className="px-3 py-3 text-sm">TOTAL</td>
                <td className="px-3 py-3 text-right text-sm">{formatCurrency(schedule.data.reduce((sum, row) => sum + row.emi, 0))}</td>
                <td className="px-3 py-3 text-right text-sm">{formatCurrency(schedule.totalInterest)}</td>
                <td className="px-3 py-3 text-right text-sm">{formatCurrency(schedule.totalPrincipal)}</td>
                <td className="px-3 py-3 text-right text-sm">{formatCurrency(schedule.totalPrepayment)}</td>
                <td className="px-3 py-3 text-right text-sm">{formatCurrency(schedule.totalPrepaymentFees)}</td>
                <td className="px-3 py-3 text-right text-sm">{formatCurrency(schedule.data.reduce((sum, row) => sum + row.totalPayment, 0))}</td>
                <td className="px-3 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Mobile-friendly note */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 lg:hidden">
        <p className="text-xs text-gray-600 text-center">
          Scroll horizontally to view all columns
        </p>
      </div>
    </div>
  );
};

export default TableView;