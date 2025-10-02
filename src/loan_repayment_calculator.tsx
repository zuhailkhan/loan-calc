import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';

const LoanRepaymentCalculator = () => {
  const principal = 3500000;
  const annualRate = 10.5;
  const months = 84;
  const emi = 59018;
  const defaultPrepayment = 41000;
  const prepaymentFeeRate = 3.5 / 100;

  const [prepayments, setPrepayments] = useState(() => {
    const initial = {};
    for (let i = 1; i <= months; i++) {
      initial[i] = defaultPrepayment;
    }
    return initial;
  });

  const monthlyRate = annualRate / 12 / 100;

  const schedule = useMemo(() => {
    let balance = principal;
    const data = [];
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalPrepayment = 0;
    let totalPrepaymentFees = 0;

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
      const prepaymentFee = prepayment * prepaymentFeeRate;
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
  }, [prepayments]);

  const handlePrepaymentChange = (month, value) => {
    setPrepayments(prev => ({
      ...prev,
      [month]: value === '' ? 0 : parseFloat(value) || 0
    }));
  };

  const setAllPrepayments = (value) => {
    const newPrepayments = {};
    for (let i = 1; i <= months; i++) {
      newPrepayments[i] = value;
    }
    setPrepayments(newPrepayments);
  };

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const downloadCSV = () => {
    const headers = ['Month', 'Due Date', 'EMI', 'Interest', 'Principal', 'Prepayment', 'Prepayment Fee', 'Total Payment', 'Balance'];
    const rows = schedule.data.map(row => [
      row.month,
      row.dueDate,
      row.emi.toFixed(2),
      row.interest.toFixed(2),
      row.principal.toFixed(2),
      row.prepayment.toFixed(2),
      row.prepaymentFee.toFixed(2),
      row.totalPayment.toFixed(2),
      row.balance.toFixed(2)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan_repayment_schedule.csv';
    a.click();
  };

  const loanClearedMonth = schedule.data.length;
  const monthsSaved = months - loanClearedMonth;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Loan Repayment Calculator</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Loan Amount</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(principal)}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Interest Rate</p>
            <p className="text-2xl font-bold text-green-700">{annualRate}% p.a.</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Monthly EMI</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(emi)}</p>
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
            <p className="text-sm text-gray-600">Prepayment Fees (3.5%)</p>
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

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> A processing fee of 3.5% is charged on all prepayments
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setAllPrepayments(defaultPrepayment)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Set All to ₹41,000
          </button>
          <button
            onClick={() => setAllPrepayments(0)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Clear All Prepayments
          </button>
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2 ml-auto"
          >
            <Download size={18} />
            Download CSV
          </button>
        </div>
      </div>

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
              {schedule.data.map((row, idx) => (
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
                      onChange={(e) => handlePrepaymentChange(row.month, e.target.value)}
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
                <td colSpan="2" className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3 text-right">{formatCurrency(schedule.data.reduce((sum, row) => sum + row.emi, 0))}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(schedule.totalInterest)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(schedule.totalPrincipal)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(schedule.totalPrepayment)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(schedule.totalPrepaymentFees)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(schedule.data.reduce((sum, row) => sum + row.totalPayment, 0))}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanRepaymentCalculator;