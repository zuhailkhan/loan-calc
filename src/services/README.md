# Firestore Database Integration

This directory contains the Firebase Firestore integration for the loan calculator application.

## Files Overview

### `firebase.ts`
Core Firebase configuration and initialization.

### `firebase.ts` (Service)
Enhanced Firestore service with the following features:

#### Key Features
- **Type-safe operations** with TypeScript interfaces
- **Input validation** for all data operations
- **Error handling** with user-friendly messages
- **Retry logic** for transient failures
- **Real-time subscriptions** for live data updates
- **Data sanitization** for security

#### Main Functions

##### `saveUserConfig(userId: string, config: LoanConfig): Promise<void>`
Saves user loan configuration to Firestore with validation and error handling.

##### `getUserConfig(userId: string): Promise<LoanConfig | null>`
Retrieves user loan configuration from Firestore.

##### `subscribeToUserConfig(userId: string, callback: Function): () => void`
Sets up real-time subscription to user configuration changes. Returns unsubscribe function.

##### `getDefaultConfig(): LoanConfig`
Returns default loan configuration with initialized prepayments.

## Data Models

### `LoanConfig`
```typescript
interface LoanConfig {
  principal: number;
  annualRate: number;
  months: number;
  emi: number;
  prepaymentFeeRate: number;
  prepayments: Record<number, number>;
}
```

### `UserConfigDocument` (Firestore)
```typescript
interface UserConfigDocument {
  userId: string;
  loanConfig: {
    principal: number;
    annualRate: number;
    months: number;
    emi: number;
    prepaymentFeeRate: number;
    defaultPrepayment: number;
  };
  prepayments: Record<string, number>; // Firestore requires string keys
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Security Rules

The Firestore security rules ensure that:
- Only authenticated users can access data
- Users can only access their own configuration data
- All other access is denied by default

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userConfigs/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Error Handling

The service includes comprehensive error handling:
- **Input validation** with descriptive error messages
- **Firestore error mapping** to user-friendly messages
- **Retry logic** for transient failures
- **Graceful degradation** for offline scenarios

## Usage Example

```typescript
import { firestoreService } from './services/firebase';

// Get default configuration
const defaultConfig = firestoreService.getDefaultConfig();

// Save user configuration
try {
  await firestoreService.saveUserConfig('user-123', defaultConfig);
  console.log('Configuration saved successfully');
} catch (error) {
  console.error('Failed to save configuration:', error.message);
}

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
```

## Requirements Fulfilled

This implementation addresses the following requirements:

- **3.1**: Save user configurations to Firebase database ✅
- **3.2**: Load user configurations from any device ✅  
- **3.3**: Display appropriate error messages when database unavailable ✅
- **3.4**: Show loading indicators during save/load operations ✅
- **3.5**: Use default parameters when no saved data exists ✅