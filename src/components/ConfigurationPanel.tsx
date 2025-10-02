import React from 'react';
import type { LoanConfig } from '../types/loan';

interface ConfigurationPanelProps {
  config: LoanConfig;
  onConfigChange: (config: LoanConfig) => void;
  onSave?: () => void;
  onReset: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange,
  onSave,
  onReset
}) => {
  const handleInputChange = (field: keyof Omit<LoanConfig, 'prepayments'>, value: string) => {
    const numericValue = parseFloat(value) || 0;
    onConfigChange({
      ...config,
      [field]: numericValue
    });
  };

  const handlePrepaymentChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newPrepayments: Record<number, number> = {};
    
    for (let i = 1; i <= config.months; i++) {
      newPrepayments[i] = numericValue;
    }
    
    onConfigChange({
      ...config,
      prepayments: newPrepayments
    });
  };

  const clearAllPrepayments = () => {
    const newPrepayments: Record<number, number> = {};
    
    for (let i = 1; i <= config.months; i++) {
      newPrepayments[i] = 0;
    }
    
    onConfigChange({
      ...config,
      prepayments: newPrepayments
    });
  };

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const validateInput = (field: keyof Omit<LoanConfig, 'prepayments'>, value: number): string | null => {
    switch (field) {
      case 'principal':
        return value <= 0 ? 'Principal amount must be greater than 0' : null;
      case 'annualRate':
        return value <= 0 || value > 50 ? 'Interest rate must be between 0 and 50%' : null;
      case 'months':
        return value <= 0 || value > 600 ? 'Loan term must be between 1 and 600 months' : null;
      case 'emi':
        return value <= 0 ? 'EMI must be greater than 0' : null;
      case 'prepaymentFeeRate':
        return value < 0 || value > 10 ? 'Prepayment fee rate must be between 0 and 10%' : null;
      default:
        return null;
    }
  };

  const getDefaultPrepayment = () => {
    const values = Object.values(config.prepayments);
    if (values.length === 0) return 0;
    
    // Check if all values are the same
    const firstValue = values[0];
    const allSame = values.every(value => value === firstValue);
    
    return allSame ? firstValue : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Loan Configuration</h2>
      
      {/* Loan Parameters */}
      <div className="space-y-6">
        <div>
          <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-2">
            Principal Amount
          </label>
          <input
            id="principal"
            type="number"
            value={config.principal}
            onChange={(e) => handleInputChange('principal', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            step="10000"
          />
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(config.principal)}</p>
          {validateInput('principal', config.principal) && (
            <p className="text-xs text-red-500 mt-1">{validateInput('principal', config.principal)}</p>
          )}
        </div>

        <div>
          <label htmlFor="annualRate" className="block text-sm font-medium text-gray-700 mb-2">
            Annual Interest Rate (%)
          </label>
          <input
            id="annualRate"
            type="number"
            value={config.annualRate}
            onChange={(e) => handleInputChange('annualRate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0.1"
            max="50"
            step="0.1"
          />
          {validateInput('annualRate', config.annualRate) && (
            <p className="text-xs text-red-500 mt-1">{validateInput('annualRate', config.annualRate)}</p>
          )}
        </div>

        <div>
          <label htmlFor="months" className="block text-sm font-medium text-gray-700 mb-2">
            Loan Term (months)
          </label>
          <input
            id="months"
            type="number"
            value={config.months}
            onChange={(e) => handleInputChange('months', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="600"
            step="1"
          />
          {validateInput('months', config.months) && (
            <p className="text-xs text-red-500 mt-1">{validateInput('months', config.months)}</p>
          )}
        </div>

        <div>
          <label htmlFor="emi" className="block text-sm font-medium text-gray-700 mb-2">
            Monthly EMI
          </label>
          <input
            id="emi"
            type="number"
            value={config.emi}
            onChange={(e) => handleInputChange('emi', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            step="100"
          />
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(config.emi)}</p>
          {validateInput('emi', config.emi) && (
            <p className="text-xs text-red-500 mt-1">{validateInput('emi', config.emi)}</p>
          )}
        </div>

        <div>
          <label htmlFor="prepaymentFeeRate" className="block text-sm font-medium text-gray-700 mb-2">
            Prepayment Fee Rate (%)
          </label>
          <input
            id="prepaymentFeeRate"
            type="number"
            value={config.prepaymentFeeRate}
            onChange={(e) => handleInputChange('prepaymentFeeRate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="10"
            step="0.1"
          />
          {validateInput('prepaymentFeeRate', config.prepaymentFeeRate) && (
            <p className="text-xs text-red-500 mt-1">{validateInput('prepaymentFeeRate', config.prepaymentFeeRate)}</p>
          )}
        </div>
      </div>

      {/* Prepayment Controls */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Prepayment Controls</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="allPrepayments" className="block text-sm font-medium text-gray-700 mb-2">
              Set All Prepayments
            </label>
            <input
              id="allPrepayments"
              type="number"
              value={getDefaultPrepayment()}
              onChange={(e) => handlePrepaymentChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1000"
              placeholder="Enter amount for all months"
            />
            <p className="text-xs text-gray-500 mt-1">
              {getDefaultPrepayment() > 0 && formatCurrency(getDefaultPrepayment())}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handlePrepaymentChange('41000')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Set to ₹41,000
            </button>
            <button
              onClick={clearAllPrepayments}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          {onSave && (
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Save Configuration
            </button>
          )}
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Information Note */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> A processing fee of {config.prepaymentFeeRate}% is charged on all prepayments
        </p>
      </div>
    </div>
  );
};

export default ConfigurationPanel;