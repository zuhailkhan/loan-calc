import { FirestoreError } from 'firebase/firestore';

// Custom error types for better error handling
export class FirestoreServiceError extends Error {
  public code?: string;
  public originalError?: Error;
  
  constructor(
    message: string,
    code?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'FirestoreServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Error message mapping for user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'You do not have permission to access this data. Please ensure you are logged in.',
  'not-found': 'The requested data was not found.',
  'unavailable': 'The service is temporarily unavailable. Please try again later.',
  'deadline-exceeded': 'The operation timed out. Please check your connection and try again.',
  'resource-exhausted': 'Too many requests. Please wait a moment and try again.',
  'unauthenticated': 'You must be logged in to perform this action.',
  'invalid-argument': 'Invalid data provided. Please check your input and try again.',
  'already-exists': 'This data already exists.',
  'aborted': 'The operation was aborted. Please try again.',
  'out-of-range': 'The requested data is out of range.',
  'unimplemented': 'This feature is not yet implemented.',
  'internal': 'An internal error occurred. Please try again later.',
  'data-loss': 'Data loss detected. Please contact support.',
  'unknown': 'An unknown error occurred. Please try again.'
};

/**
 * Convert Firestore errors to user-friendly messages
 */
export const handleFirestoreError = (error: unknown): FirestoreServiceError => {
  if (error instanceof FirestoreError) {
    const userMessage = ERROR_MESSAGES[error.code] || ERROR_MESSAGES.unknown;
    return new FirestoreServiceError(userMessage, error.code, error);
  }
  
  if (error instanceof Error) {
    return new FirestoreServiceError(
      'An unexpected error occurred. Please try again.',
      'unknown',
      error
    );
  }
  
  return new FirestoreServiceError(
    'An unknown error occurred. Please try again.',
    'unknown'
  );
};

// Non-retryable error codes
const NON_RETRYABLE_CODES = [
  'permission-denied',
  'not-found',
  'invalid-argument',
  'unauthenticated',
  'already-exists'
];

/**
 * Check if an error should be retried
 */
const shouldRetry = (error: unknown): boolean => {
  if (error instanceof FirestoreError) {
    return !NON_RETRYABLE_CODES.includes(error.code);
  }
  return true;
};

/**
 * Retry wrapper for Firestore operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on certain error types or if this is the last attempt
      if (!shouldRetry(error) || attempt === maxRetries) {
        throw handleFirestoreError(lastError);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw handleFirestoreError(lastError!);
};