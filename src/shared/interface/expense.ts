import type { IAccountRef } from './banking';
import type { IRecordOrganization } from './common';

/** Mirrors the API's ExpenseCategory enum. */
export type ExpenseCategory =
  | 'PARTS'
  | 'SUBLET'
  | 'CONSUMABLES'
  | 'LABOR'
  | 'TOWING'
  | 'FEES'
  | 'OTHER';

/** Mirrors the API's PaymentMode enum. */
export type ExpensePaymentMode =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CARD'
  | 'MOBILE_MONEY'
  | 'CHEQUE'
  | 'ONLINE'
  | 'OTHER';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  PARTS: 'Parts',
  SUBLET: 'Sublet Work',
  CONSUMABLES: 'Consumables',
  LABOR: 'Labor',
  TOWING: 'Towing',
  FEES: 'Fees',
  OTHER: 'Other',
};

export const EXPENSE_PAYMENT_MODE_LABELS: Record<ExpensePaymentMode, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card',
  MOBILE_MONEY: 'Mobile Money',
  CHEQUE: 'Cheque',
  ONLINE: 'Online',
  OTHER: 'Other',
};

export const expenseCategoryLabel = (category?: string | null) =>
  category
    ? (EXPENSE_CATEGORY_LABELS[category as ExpenseCategory] ?? category)
    : '—';

export const expensePaymentModeLabel = (mode?: string | null) =>
  mode
    ? (EXPENSE_PAYMENT_MODE_LABELS[mode as ExpensePaymentMode] ?? mode)
    : '—';

/** One row of GET back-office/expenses. Amounts are decimal strings. */
export interface IExpense {
  id: string;
  organizationId: string;
  expenseNumber: string | null;
  date: string;
  category: ExpenseCategory | string;
  name: string | null;
  description: string | null;
  vendorName: string | null;
  amount: string;
  paymentMode: ExpensePaymentMode | string | null;
  fileUrl?: string | null;
  createdAt: string;
  organization?: IRecordOrganization;
  jobCard?: { id: string; jobNumber: string } | null;
  invoice?: { id: string; invoiceNumber: string } | null;
  invoiceLineItem?: { id: string; name: string } | null;
  item?: { id: string; name: string } | null;
  paidThroughAccount?: IAccountRef | null;
}

/** An expense as an invoice's detail lists it (GET /invoices/:id). */
export interface IInvoiceExpense {
  id: string;
  expenseNumber: string | null;
  date: string;
  category: ExpenseCategory | string;
  name: string | null;
  description: string | null;
  vendorName: string | null;
  amount: string;
  paymentMode: ExpensePaymentMode | string | null;
  invoiceLineItemId: string | null;
  jobCardId: string | null;
  fileUrl: string | null;
  paidThroughAccount: IAccountRef | null;
}

export interface IGetExpensesFilter {
  page?: number;
  limit?: number;
  organizationId?: string;
  /** Expense number, name, description or vendor. */
  search?: string;
  category?: string;
  paymentMode?: string;
  jobCardId?: string;
  invoiceId?: string;
  paidThroughAccountId?: string;
  /** YYYY-MM-DD, inclusive. */
  dateFrom?: string;
  dateTo?: string;
}
