# Utility Functions

## CSV Export (`csvExport.ts`)

### Overview
Provides functionality to export loan repayment schedules to CSV format with comprehensive error handling and metadata.

### Features
- **Complete Data Export**: Exports all calculated fields including month, due date, EMI, interest, principal, prepayment, prepayment fee, total payment, and balance
- **Metadata Section**: Includes loan configuration details and summary statistics in the exported file
- **Error Handling**: Custom `ExportError` class for graceful error handling
- **Configurable Options**: Supports custom filename and optional timestamp
- **Data Validation**: Validates input data before export
- **Browser Compatibility**: Uses standard Blob API for file downloads

### Usage

```typescript
import { exportLoanScheduleToCSV, ExportError } from '../utils/csvExport';

try {
  exportLoanScheduleToCSV(schedule, config, {
    filename: 'loan_repayment_schedule',
    includeTimestamp: true
  });
} catch (error) {
  if (error instanceof ExportError) {
    console.error('Export failed:', error.message);
  }
}
```

### Export Format

The CSV file includes:
1. **Metadata Section**:
   - Loan configuration (principal, interest rate, term, EMI, prepayment fee rate)
   - Summary statistics (total interest, prepayment, fees, time saved)

2. **Repayment Schedule**:
   - All monthly payment details
   - Total row with aggregated values

### Error Handling

The export function handles the following error scenarios:
- Empty or invalid schedule data
- Blob creation failures
- File download failures
- Unexpected errors during export

All errors are wrapped in the `ExportError` class with descriptive messages.

## Firestore Errors (`firestore-errors.ts`)

Provides user-friendly error messages for Firebase/Firestore operations.

## Loan Calculations (`loanCalculations.ts`)

Contains core loan calculation logic for EMI, interest, and prepayment scenarios.
