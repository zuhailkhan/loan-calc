import { useState, useEffect, useCallback, useRef } from 'react';
import type { LoanConfig } from '../types/loan';
import { firestoreService } from '../services/firebase';
import { FirestoreServiceError } from '../utils/firestore-errors';

interface DataPersistenceState {
  config: LoanConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isOnline: boolean;
}

interface DataPersistenceActions {
  saveConfig: (config: LoanConfig) => Promise<void>;
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
}

interface UseDataPersistenceReturn extends DataPersistenceState, DataPersistenceActions {}

/**
 * Hook for managing data persistence with optimistic updates and error handling
 */
export const useDataPersistence = (userId: string | null): UseDataPersistenceReturn => {
  const [state, setState] = useState<DataPersistenceState>({
    config: null,
    loading: true,
    saving: false,
    error: null,
    isOnline: navigator.onLine
  });

  const lastFailedOperation = useRef<(() => Promise<void>) | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, error: null }));
      // Retry last failed operation when coming back online
      if (lastFailedOperation.current) {
        lastFailedOperation.current();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ 
        ...prev, 
        isOnline: false,
        error: 'You are currently offline. Changes will be saved when connection is restored.'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load user configuration on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setState(prev => ({ ...prev, config: null, loading: false }));
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const loadConfig = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // First, try to get the config once
        const config = await firestoreService.getUserConfig(userId);
        
        if (config) {
          setState(prev => ({ ...prev, config, loading: false }));
        } else {
          // No saved config, use default
          const defaultConfig = firestoreService.getDefaultConfig();
          setState(prev => ({ ...prev, config: defaultConfig, loading: false }));
        }

        // Then subscribe to real-time updates
        unsubscribe = firestoreService.subscribeToUserConfig(userId, (updatedConfig) => {
          if (updatedConfig) {
            setState(prev => ({ 
              ...prev, 
              config: updatedConfig,
              error: null 
            }));
          }
        });
      } catch (error) {
        const errorMessage = error instanceof FirestoreServiceError 
          ? error.message 
          : 'Failed to load your configuration. Please try again.';
        
        setState(prev => ({ 
          ...prev, 
          loading: false,
          error: errorMessage,
          config: firestoreService.getDefaultConfig() // Fallback to default
        }));

        // Store the operation for retry
        lastFailedOperation.current = loadConfig;
      }
    };

    loadConfig();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [userId]);

  // Save configuration with optimistic updates and debouncing
  const saveConfig = useCallback(async (config: LoanConfig) => {
    if (!userId) {
      setState(prev => ({ 
        ...prev, 
        error: 'You must be logged in to save configurations.' 
      }));
      return;
    }

    // Check if online
    if (!navigator.onLine) {
      setState(prev => ({ 
        ...prev, 
        error: 'You are offline. Changes will be saved when connection is restored.',
        config // Optimistically update local state
      }));
      
      // Store the operation for retry when online
      lastFailedOperation.current = () => saveConfig(config);
      return;
    }

    // Optimistically update the UI
    setState(prev => ({ ...prev, config, saving: true, error: null }));

    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await firestoreService.saveUserConfig(userId, config);
        setState(prev => ({ ...prev, saving: false }));
        lastFailedOperation.current = null; // Clear on success
      } catch (error) {
        const errorMessage = error instanceof FirestoreServiceError 
          ? error.message 
          : 'Failed to save your configuration. Please try again.';
        
        setState(prev => ({ 
          ...prev, 
          saving: false,
          error: errorMessage
        }));

        // Store the operation for retry
        lastFailedOperation.current = () => saveConfig(config);
      }
    }, 500); // 500ms debounce
  }, [userId]);

  // Clear error message
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Retry last failed operation
  const retryLastOperation = useCallback(async () => {
    if (lastFailedOperation.current) {
      setState(prev => ({ ...prev, error: null }));
      await lastFailedOperation.current();
    }
  }, []);

  return {
    ...state,
    saveConfig,
    clearError,
    retryLastOperation
  };
};
