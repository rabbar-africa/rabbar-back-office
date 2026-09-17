/**
 * Display labels for subscription billing enums returned by the API.
 * Unknown values fall through unchanged so new enum members still render.
 */

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  // Period ended unpaid — the org is in its grace period and can still use the app.
  PAST_DUE: 'Payment due',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  INACTIVE: 'Inactive',
};

export const subscriptionStatusLabel = (status?: string | null): string =>
  status ? (SUBSCRIPTION_STATUS_LABELS[status.toUpperCase()] ?? status) : '';

export const SUBSCRIPTION_PAYMENT_METHOD_LABELS: Record<string, string> = {
  PAYSTACK_CARD: 'Card (Paystack)',
  PAYSTACK_BANK_TRANSFER: 'Bank transfer (Paystack)',
  PAYSTACK_USSD: 'USSD (Paystack)',
  PAYSTACK_BANK: 'Bank (Paystack)',
  PROMO: 'Promo code',
  BANK_TRANSFER: 'Bank transfer',
  CARD: 'Card',
  CASH: 'Cash',
  MOBILE_MONEY: 'Mobile money',
  CHEQUE: 'Cheque',
  ONLINE: 'Online',
  OTHER: 'Other',
};

export const subscriptionPaymentMethodLabel = (method?: string | null) =>
  method ? (SUBSCRIPTION_PAYMENT_METHOD_LABELS[method] ?? method) : '—';

/**
 * Days an unpaid org keeps using the app after its period ends, before the
 * subscription expires. Mirrors GRACE_PERIOD_DAYS on the API.
 */
export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 7;

/** The "expiring soon" reminder goes out this many days before the period ends. */
export const SUBSCRIPTION_RENEWAL_REMINDER_DAYS = 3;

/** The free default plan every organization starts on. */
export const FREE_PLAN_TIER = 'STARTER';
