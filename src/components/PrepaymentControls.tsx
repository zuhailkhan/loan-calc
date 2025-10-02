import React from 'react';
import { Download } from 'lucide-react';

interface PrepaymentControlsProps {
  defaultPrepayment: number;
  prepaymentFeeRate: number;
  onSetAllPrepayments: (value: number) => void;
  onClearAllPrepayments: () => void;
  onDownloadCSV: () => void;
}

const PrepaymentControls: React.FC<PrepaymentControlsProps> = ({
  defaultPrepayment,
  prepaymentFeeRate,
  onSetAllPrepayments,
  onClearAllPrepayments,
  onDownloadCSV
}) => {
  return (
    <>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> A processing fee of {prepaymentFeeRate}% is charged on all prepayments
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => onSetAllPrepayments(defaultPrepayment)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Set All to ₹{defaultPrepayment.toLocaleString('en-IN')}
        </button>
        <button
          onClick={onClearAllPrepayments}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Clear All Prepayments
        </button>
        <button
          onClick={onDownloadCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2 ml-auto"
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>
    </>
  );
};

export default PrepaymentControls;
