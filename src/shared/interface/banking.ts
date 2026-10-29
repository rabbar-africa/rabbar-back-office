/**
 * Accounts and statements, as the back office reads them for an organization.
 * Mirrors `back-office/organizations/:id/bank-accounts/:accountId/statement`
 * and `back-office/organizations/:id/business-statement`.
 */

export type OrgAccountType = 'BANK' | 'CASH';

/** An org account as it's embedded in other records. */
export interface IAccountRef {
  id: string;
  type: OrgAccountType;
  accountName: string;
  /** Null only for the Cash account. */
  accountNumber: string | null;
  bankName: string | null;
  bankCode?: string | null;
  isPrimary: boolean;
}

export type StatementEntryKind =
  | 'OPENING_BALANCE'
  | 'PAYMENT_RECEIVED'
  | 'BANK_CHARGE'
  | 'EXPENSE'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface StatementLine {
  kind: StatementEntryKind;
  /** ISO date (midnight UTC); use the first 10 characters. */
  date: string;
  /** PR-…, EXP-…, a deposit slip number. */
  reference: string | null;
  /** "Payment from Mrs Okafor", "Cash deposited"… */
  title: string;
  /** "Bank transfer · for INV-000123" */
  details: string | null;
  moneyIn: number;
  moneyOut: number;
  /** Running balance after this line. */
  balance: number;
  /** The payment, expense or transfer behind the line. */
  sourceId: string | null;
}

export interface AccountStatement {
  account: IAccountRef;
  currencyCode: string;
  /** YYYY-MM-DD, both ends inclusive. */
  period: { from: string; to: string };
  generatedAt: string;
  /** Brought forward at `period.from`. */
  openingBalance: number;
  closingBalance: number;
  totals: {
    moneyIn: number;
    moneyOut: number;
    byKind: Record<StatementEntryKind, { count: number; amount: number }>;
  };
  lines: StatementLine[];
}

/** YYYY-MM-DD; omitted → this month up to today (Lagos). */
export interface StatementRange {
  from?: string;
  to?: string;
}

export interface EmailStatementPayload extends StatementRange {
  /** Omitted → the business email, else the owner's. */
  email?: string;
}

export interface EmailStatementResponse {
  sentTo: string;
}

/** One account's period, as the business statement lists it. */
export interface BusinessAccountRow {
  id: string;
  type: OrgAccountType;
  label: string;
  isPrimary: boolean;
  openingBalance: number;
  moneyIn: number;
  moneyOut: number;
  closingBalance: number;
  /** The part of money in / out that was a transfer between own accounts. */
  transfersIn: number;
  transfersOut: number;
}

/** The whole business for a period. */
export interface BusinessStatement {
  currencyCode: string;
  period: { from: string; to: string };
  generatedAt: string;
  accounts: {
    rows: BusinessAccountRow[];
    /** Own-account transfers are left out of money in / out (they cancel). */
    total: {
      openingBalance: number;
      moneyIn: number;
      moneyOut: number;
      closingBalance: number;
    };
    /** Payments and expenses recorded with no account. */
    unassigned: { moneyIn: number; moneyOut: number } | null;
  };
  sales: {
    invoiceCount: number;
    invoiced: number;
    vatCharged: number;
    salesBeforeTax: number;
    writtenOff: number;
    collected: number;
    paymentCount: number;
    /** What customers owed on `period.to`. */
    owedAtEnd: number;
  };
  spending: {
    byCategory: Array<{
      category: string;
      label: string;
      count: number;
      amount: number;
    }>;
    expenses: number;
    bankCharges: number;
    total: number;
  };
  profit: {
    salesBeforeTax: number;
    collectedBeforeTax: number;
    spent: number;
    /** Sales before tax − written off − spending. */
    onBilled: number;
    /** Collected before tax − spending. */
    onCollected: number;
  };
  tax: {
    charged: Array<{ name: string; amount: number }>;
    totalCharged: number;
    inCollected: number;
  };
  topCustomers: Array<{ name: string; collected: number; payments: number }>;
}

/** "Cash", or "GTBank Current — GTBank ••1234". */
export function formatAccountLabel(account: IAccountRef): string {
  if (account.type === 'CASH') return account.accountName;
  const last4 = account.accountNumber?.slice(-4);
  return [
    account.accountName,
    [account.bankName, last4 ? `••${last4}` : ''].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(' — ');
}
