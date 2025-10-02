import React, { useState, useCallback, useEffect } from 'react';
import type { LoanConfig } from '../types/loan';
import { useLoanCalculation } from '../hooks/useLoanCalculation';
import { useDataPersistence } from '../hooks/useDataPersistence';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import ConfigurationPanel from './ConfigurationPanel';
import TableView from './TableView';
import { Loader2, WifiOff, Save } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Data persistence hook with optimistic updates
  const { 
    config: persistedConfig, 
    loading, 
    saving, 
    error,
    isOnline,
    saveConfig,
    clearError,
    retryLastOperation
  } = useDataPersistence(user?.uid || null);

  // Local config state (synced with persisted config)
  const [config, setConfig] = useState<LoanConfig | null>(null);

  // Sync persisted config to local state
  useEffect(() => {
    if (persistedConfig) {
      setConfig(persistedConfig);
    }
  }, [persistedConfig]);

  // Show error toasts
  useEffect(() => {
    if (error) {
      if (!isOnline) {
        showToast(error, 'offline', {
          label: 'Retry',
          onClick: () => void retryLastOperation()
        });
      } else {
        showToast(error, 'error', {
          label: 'Retry',
          onClick: () => void retryLastOperation()
        });
      }
    }
  }, [error, isOnline, showToast, retryLastOperation]);

  // Calculate loan schedule based on current configuration
  const schedule = useLoanCalculation(config || persistedConfig || {
    principal: 0,
    annualRate: 0,
    months: 0,
    emi: 0,
    prepaymentFeeRate: 0,
    prepayments: {}
  });

  // Handle configuration changes with auto-save
  const handleConfigChange = useCallback((newConfig: LoanConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig); // Optimistically save to Firestore
    clearError(); // Clear any previous errors
  }, [saveConfig, clearError]);

  // Handle individual prepayment changes with auto-save
  const handlePrepaymentChange = useCallback((month: number, amount: number) => {
    setConfig(prevConfig => {
      if (!prevConfig) return prevConfig;
      
      const newConfig = {
        ...prevConfig,
        prepayments: {
          ...prevConfig.prepayments,
          [month]: amount
        }
      };
      
      saveConfig(newConfig); // Optimistically save to Firestore
      clearError(); // Clear any previous errors
      return newConfig;
    });
  }, [saveConfig, clearError]);

  // Reset to default configuration with save
  const handleReset = useCallback(() => {
    if (!persistedConfig) return;
    
    const defaultPrepayments: Record<number, number> = {};
    const defaultPrepayment = 41000;
    
    for (let i = 1; i <= persistedConfig.months; i++) {
      defaultPrepayments[i] = defaultPrepayment;
    }
    
    const resetConfig = {
      ...persistedConfig,
      prepayments: defaultPrepayments
    };
    
    setConfig(resetConfig);
    saveConfig(resetConfig); // Save reset config to Firestore
    clearError(); // Clear any previous errors
    showToast('Configuration reset to defaults', 'success');
  }, [persistedConfig, saveConfig, clearError, showToast]);



  // Show loading state
  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your configuration...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up your loan calculator</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 animate-fade-in">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Loan Repayment Calculator</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Configure your loan parameters and view the repayment schedule
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Saving indicator */}
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
                {/* Saved indicator */}
                {!saving && !error && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Save className="w-4 h-4" />
                    <span>Saved</span>
                  </div>
                )}
                {/* Offline indicator */}
                {!isOnline && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Configuration Panel - Left Side */}
          <div className="lg:col-span-1">
            <ConfigurationPanel
              config={config}
              onConfigChange={handleConfigChange}
              onReset={handleReset}
            />
          </div>

          {/* Table View - Right Side */}
          <div className="lg:col-span-2">
            <TableView
              schedule={schedule}
              config={config}
              onPrepaymentChange={handlePrepaymentChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;