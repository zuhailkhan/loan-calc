import React from 'react';
import type { ScheduleRow } from '../types/loan';

interface ScheduleTableProps {
  schedule: ScheduleRow[];
  prepayments: Record<number, number>;
  totalInterest: number;
  totalPrincipal: number;
  totalPrepayment: number;
  totalPrepaymentFees: number;
  formatCurrency: (amount: number) => string;
  onPrepaymentChange: (month: number, value: string) => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedule,
  prepayments,
  totalInterest,
  totalPrincipal,
  totalPrepayment,
  totalPrepaymentFees,
  formatCurrency,
  onPrepaymentChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Month</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-right">EMI</th>
              <th className="px-4 py-3 text-right">Interest</th>
              <th className="px-4 py-3 text-right">Principal</th>
              <th className="px-4 py-3 text-right">Prepayment</th>
              <th className="px-4 py-3 text-right">Fee (3.5%)</th>
              <th className="px-4 py-3 text-right">Total Payment</th>
              <th className="px-4 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, idx) => (
              <tr key={row.month} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3 font-medium">{row.month}</td>
                <td className="px-4 py-3 text-sm">{row.dueDate}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.emi)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.interest)}</td>
                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(row.principal)}</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    value={prepayments[row.month] || 0}
                    onChange={(e) => onPrepaymentChange(row.month, e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="1000"
                  />
                </td>
                <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(row.prepaymentFee)}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(row.totalPayment)}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-700">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold">
            <tr>
              <td colSpan={2} className="px-4 py-3">TOTAL</td>
              <td className="px-4 py-3 text-right">{formatCurrency(schedule.reduce((sum, row) => sum + row.emi, 0))}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totalInterest)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totalPrincipal)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totalPrepayment)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totalPrepaymentFees)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(schedule.reduce((sum, row) => sum + row.totalPayment, 0))}</td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ScheduleTable;
