import moment from 'moment';
import type { IPaymentReceived } from '@/shared/interface/payment';

/** Shared by the on-screen receipt and its PDF so the two never drift. */

export const toNum = (v: string | number | null | undefined) =>
  Number(v ?? 0) || 0;

export const formatReceiptDate = (v?: string | null) =>
  v ? moment(v).format('DD MMM YYYY') : '—';

export const PAYMENT_MODE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card',
  MOBILE_MONEY: 'Mobile Money',
  CHEQUE: 'Cheque',
  ONLINE: 'Online',
  OTHER: 'Other',
};

export type RibbonKind = 'paid' | 'refunded' | 'failed' | 'draft';

/** Status → the corner ribbon. */
export function ribbonFor(status: string): { label: string; kind: RibbonKind } {
  const s = (status || '').toUpperCase();
  if (['CONFIRMED', 'COMPLETED', 'PAID'].includes(s))
    return { label: 'Paid', kind: 'paid' };
  if (s === 'FAILED') return { label: 'Failed', kind: 'failed' };
  if (['REFUNDED', 'PARTIALLY_REFUNDED'].includes(s))
    return { label: 'Refunded', kind: 'refunded' };
  return { label: 'Draft', kind: 'draft' };
}

/** What the customer still owes across the invoices this payment settled. */
export const outstandingAfter = (payment: IPaymentReceived) =>
  (payment.allocations ?? []).reduce(
    (sum, a) => sum + toNum(a.invoiceBalanceAfter),
    0
  );

export const receivedFromName = (payment: IPaymentReceived) =>
  payment.customerName || payment.client?.displayName || '—';
