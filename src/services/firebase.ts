import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import type { 
  LoanConfig, 
  UserConfigDocument
} from '../types/loan';
import { 
  DEFAULT_LOAN_CONFIG,
  DEFAULT_PREPAYMENT_AMOUNT
} from '../types/loan';
import { handleFirestoreError, withRetry } from '../utils/firestore-errors';
import { validateLoanConfig, validateUserId, sanitizePrepayments } from '../utils/validation';

// Initialize default prepayments
const initializeDefaultPrepayments = (): Record<number, number> => {
  const prepayments: Record<number, number> = {};
  for (let i = 1; i <= DEFAULT_LOAN_CONFIG.months; i++) {
    prepayments[i] = DEFAULT_PREPAYMENT_AMOUNT;
  }
  return prepayments;
};

// Helper function to convert prepayments for Firestore (number keys to string keys)
const prepaymentNumberKeysToStringKeys = (prepayments: Record<number, number>): Record<string, number> => {
  const result: Record<string, number> = {};
  Object.entries(prepayments).forEach(([key, value]) => {
    result[key.toString()] = value;
  });
  return result;
};

// Helper function to convert prepayments from Firestore (string keys to number keys)
const prepaymentStringKeysToNumberKeys = (prepayments: Record<string, number>): Record<number, number> => {
  const result: Record<number, number> = {};
  Object.entries(prepayments).forEach(([key, value]) => {
    result[parseInt(key, 10)] = value;
  });
  return result;
};

// Authentication service
export const authService = {
  signIn: (email: string, password: string) => 
    signInWithEmailAndPassword(auth, email, password),
  
  signUp: (email: string, password: string) => 
    createUserWithEmailAndPassword(auth, email, password),
  
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },
  
  signOut: () => firebaseSignOut(auth),
  
  onAuthStateChanged: (callback: (user: User | null) => void) => 
    onAuthStateChanged(auth, callback)
};

// Enhanced Firestore service with proper typing and error handling
export const firestoreService = {
  /**
   * Save user loan configuration to Firestore
   */
  saveUserConfig: async (userId: string, config: LoanConfig): Promise<void> => {
    // Validate inputs
    if (!validateUserId(userId)) {
      throw new Error('Invalid user ID provided');
    }

    const validationErrors = validateLoanConfig(config);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid configuration: ${validationErrors.join(', ')}`);
    }

    return withRetry(async () => {
      const userConfigRef = doc(db, 'userConfigs', userId);
      
      // Sanitize prepayments
      const sanitizedPrepayments = sanitizePrepayments(config.prepayments);
      
      // Prepare document data according to UserConfigDocument interface
      const documentData: Partial<UserConfigDocument> = {
        userId,
        loanConfig: {
          principal: config.principal,
          annualRate: config.annualRate,
          months: config.months,
          emi: config.emi,
          prepaymentFeeRate: config.prepaymentFeeRate,
          defaultPrepayment: DEFAULT_PREPAYMENT_AMOUNT
        },
        prepayments: prepaymentNumberKeysToStringKeys(sanitizedPrepayments),
        updatedAt: serverTimestamp() as Timestamp
      };

      // Add createdAt only for new documents
      const existingDoc = await getDoc(userConfigRef);
      if (!existingDoc.exists()) {
        documentData.createdAt = serverTimestamp() as Timestamp;
      }

      await setDoc(userConfigRef, documentData, { merge: true });
    });
  },
  
  /**
   * Get user loan configuration from Firestore
   */
  getUserConfig: async (userId: string): Promise<LoanConfig | null> => {
    // Validate inputs
    if (!validateUserId(userId)) {
      throw new Error('Invalid user ID provided');
    }

    return withRetry(async () => {
      const userConfigRef = doc(db, 'userConfigs', userId);
      const docSnap = await getDoc(userConfigRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data() as UserConfigDocument;
      
      // Convert back to LoanConfig format with sanitized prepayments
      const loanConfig: LoanConfig = {
        principal: data.loanConfig.principal,
        annualRate: data.loanConfig.annualRate,
        months: data.loanConfig.months,
        emi: data.loanConfig.emi,
        prepaymentFeeRate: data.loanConfig.prepaymentFeeRate,
        prepayments: sanitizePrepayments(prepaymentStringKeysToNumberKeys(data.prepayments))
      };

      return loanConfig;
    });
  },
  
  /**
   * Subscribe to real-time updates of user configuration
   */
  subscribeToUserConfig: (userId: string, callback: (config: LoanConfig | null) => void): (() => void) => {
    // Validate inputs
    if (!validateUserId(userId)) {
      console.error('Invalid user ID provided for subscription');
      callback(null);
      return () => {}; // Return empty unsubscribe function
    }

    const userConfigRef = doc(db, 'userConfigs', userId);
    
    return onSnapshot(
      userConfigRef, 
      (doc) => {
        try {
          if (doc.exists()) {
            const data = doc.data() as UserConfigDocument;
            
            // Convert to LoanConfig format with sanitized prepayments
            const loanConfig: LoanConfig = {
              principal: data.loanConfig.principal,
              annualRate: data.loanConfig.annualRate,
              months: data.loanConfig.months,
              emi: data.loanConfig.emi,
              prepaymentFeeRate: data.loanConfig.prepaymentFeeRate,
              prepayments: sanitizePrepayments(prepaymentStringKeysToNumberKeys(data.prepayments))
            };
            
            callback(loanConfig);
          } else {
            callback(null);
          }
        } catch (error) {
          const firestoreError = handleFirestoreError(error);
          console.error('Error processing config update:', firestoreError.message);
          callback(null);
        }
      },
      (error) => {
        const firestoreError = handleFirestoreError(error);
        console.error('Error in config subscription:', firestoreError.message);
        callback(null);
      }
    );
  },

  /**
   * Get default loan configuration with initialized prepayments
   */
  getDefaultConfig: (): LoanConfig => {
    return {
      ...DEFAULT_LOAN_CONFIG,
      prepayments: initializeDefaultPrepayments()
    };
  }
};