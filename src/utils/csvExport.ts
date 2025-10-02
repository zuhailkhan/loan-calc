import type { LoanScheduleData, LoanConfig } from '../types/loan';

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
}

export class ExportError extends Error {
  public readonly cause?: unknown;
  
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ExportError';
    this.cause = cause;
  }
}

/**
 * Generates and downloads a CSV file with the loan repayment schedule
 * @param schedule - The loan schedule data to export
 * @param config - The loan configuration (used for metadata)
 * @param options - Export options (filename, timestamp)
 * @throws {ExportError} If the export fails
 */
export const exportLoanScheduleToCSV = (
  schedule: LoanScheduleData,
  config: LoanConfig,
  options: ExportOptions = {}
): void => {
  try {
    const filename = options.filename ?? 'loan_repayment_schedule';
    const includeTimestamp = options.includeTimestamp ?? true;

    // Validate input data
    if (!schedule?.data || schedule.data.length === 0) {
      throw new ExportError('No data available to export');
    }

    // Build CSV content
    const headers = [
      'Month',
      'Due Date',
      'EMI',
      'Interest',
      'Principal',
      'Prepayment',
      'Prepayment Fee',
      'Total Payment',
      'Balance'
    ];

    const rows = schedule.data.map(row => [
      row.month.toString(),
      row.dueDate,
      row.emi.toFixed(2),
      row.interest.toFixed(2),
      row.principal.toFixed(2),
      row.prepayment.toFixed(2),
      row.prepaymentFee.toFixed(2),
      row.totalPayment.toFixed(2),
      row.balance.toFixed(2)
    ]);

    // Add summary row
    const totalRow = [
      'TOTAL',
      '',
      schedule.data.reduce((sum, row) => sum + row.emi, 0).toFixed(2),
      schedule.totalInterest.toFixed(2),
      schedule.totalPrincipal.toFixed(2),
      schedule.totalPrepayment.toFixed(2),
      schedule.totalPrepaymentFees.toFixed(2),
      schedule.data.reduce((sum, row) => sum + row.totalPayment, 0).toFixed(2),
      ''
    ];

    // Add metadata section
    const metadata = [
      ['Loan Repayment Schedule'],
      [''],
      ['Loan Configuration:'],
      ['Principal Amount', config.principal.toFixed(2)],
      ['Annual Interest Rate', `${config.annualRate}%`],
      ['Loan Term (months)', config.months.toString()],
      ['Monthly EMI', config.emi.toFixed(2)],
      ['Prepayment Fee Rate', `${config.prepaymentFeeRate}%`],
      [''],
      ['Summary:'],
      ['Total Interest Paid', schedule.totalInterest.toFixed(2)],
      ['Total Principal Paid', schedule.totalPrincipal.toFixed(2)],
      ['Total Prepayment', schedule.totalPrepayment.toFixed(2)],
      ['Total Prepayment Fees', schedule.totalPrepaymentFees.toFixed(2)],
      ['Loan Cleared In (months)', schedule.data.length.toString()],
      ['Time Saved (months)', (config.months - schedule.data.length).toString()],
      [''],
      ['Repayment Schedule:'],
      ['']
    ];

    // Combine all sections
    const csvContent = [
      ...metadata,
      headers,
      ...rows,
      totalRow
    ].map(row => row.join(',')).join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Check if Blob was created successfully
    if (!blob || blob.size === 0) {
      throw new ExportError('Failed to create CSV file');
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Generate filename with optional timestamp
    const timestamp = includeTimestamp 
      ? `_${new Date().toISOString().split('T')[0]}`
      : '';
    const finalFilename = `${filename}${timestamp}.csv`;
    
    link.href = url;
    link.download = finalFilename;
    link.style.display = 'none';
    
    // Append to body, click, and cleanup
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    if (error instanceof ExportError) {
      throw error;
    }
    throw new ExportError(
      'Failed to export CSV file. Please try again.',
      error
    );
  }
};
