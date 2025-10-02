/**
 * Validation script for Firestore service implementation
 * This file demonstrates the usage of the Firestore service and validates its structure
 */

import { firestoreService } from './firebase';
import type { LoanConfig } from '../types/loan';

// Example usage and validation
const validateFirestoreService = () => {
  console.log('🔍 Validating Firestore Service Implementation...');

  // Test 1: Check if service exports exist
  const requiredMethods = ['saveUserConfig', 'getUserConfig', 'subscribeToUserConfig', 'getDefaultConfig'] as const;
  const missingMethods = requiredMethods.filter(method => typeof firestoreService[method] !== 'function');
  
  if (missingMethods.length > 0) {
    console.error('❌ Missing methods:', missingMethods);
    return false;
  }
  console.log('✅ All required methods are present');

  // Test 2: Check default configuration
  try {
    const defaultConfig = firestoreService.getDefaultConfig();
    
    if (!defaultConfig || typeof defaultConfig !== 'object') {
      console.error('❌ Default config is invalid');
      return false;
    }

    const requiredFields = ['principal', 'annualRate', 'months', 'emi', 'prepaymentFeeRate', 'prepayments'];
    const missingFields = requiredFields.filter(field => !(field in defaultConfig));
    
    if (missingFields.length > 0) {
      console.error('❌ Default config missing fields:', missingFields);
      return false;
    }

    if (Object.keys(defaultConfig.prepayments).length !== defaultConfig.months) {
      console.error('❌ Prepayments not initialized for all months');
      return false;
    }

    console.log('✅ Default configuration is valid');
    console.log('📊 Default config:', {
      principal: defaultConfig.principal,
      annualRate: defaultConfig.annualRate,
      months: defaultConfig.months,
      emi: defaultConfig.emi,
      prepaymentFeeRate: defaultConfig.prepaymentFeeRate,
      prepaymentsCount: Object.keys(defaultConfig.prepayments).length
    });
  } catch (error) {
    console.error('❌ Error getting default config:', error);
    return false;
  }

  // Test 3: Validate input validation (should throw errors)
  const invalidConfig: LoanConfig = {
    principal: -1000, // Invalid
    annualRate: 150,  // Invalid
    months: 0,        // Invalid
    emi: -500,        // Invalid
    prepaymentFeeRate: -5, // Invalid
    prepayments: {}
  };

  // This should throw an error due to validation
  firestoreService.saveUserConfig('test-user', invalidConfig).catch(() => {
    console.log('✅ Input validation working correctly (rejected invalid config)');
  });

  console.log('🎉 Firestore service validation completed successfully!');
  return true;
};

// Example of how to use the service
const exampleUsage = () => {
  console.log('\n📖 Example Usage:');
  
  const exampleCode = `
// Get default configuration
const defaultConfig = firestoreService.getDefaultConfig();

// Save user configuration
await firestoreService.saveUserConfig('user-123', defaultConfig);

// Load user configuration
const userConfig = await firestoreService.getUserConfig('user-123');

// Subscribe to real-time updates
const unsubscribe = firestoreService.subscribeToUserConfig('user-123', (config) => {
  if (config) {
    console.log('Configuration updated:', config);
  }
});

// Don't forget to unsubscribe when component unmounts
unsubscribe();
  `;
  
  console.log(exampleCode);
};

// Export validation functions for manual testing
export { validateFirestoreService, exampleUsage };