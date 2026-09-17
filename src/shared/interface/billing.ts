import type { IPlan } from '@/features/organizations/api/types';

/**
 * Cross-organization billing, run from the back office.
 * Mirrors `GET /back-office/subscriptions`, `GET /back-office/subscriptions/payments`,
 * `POST /back-office/subscriptions/run-billing` and `PATCH /back-office/plans/:id`.
 */

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'INACTIVE';

export interface ISubscriptionOrganization {
  id: string;
  name: string;
  slug: string;
  companyEmail: string | null;
}

/** One row of the subscriptions list (no payments — open the org for those). */
export interface ISubscriptionListItem {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus | string;
  /** Coverage window of the current paid period. Null on the free plan. */
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  startedAt: string | null;
  cancelledAt: string | null;
  /** Charge the saved card automatically when the period ends. */
  autoRenew: boolean;
  /** The org asked to stop: drops to Starter when the period ends. */
  cancelAtPeriodEnd: boolean;
  /** A cheaper paid plan to switch to when the period ends. */
  pendingPlanId: string | null;
  /** When the period ended unpaid (PAST_DUE only). */
  pastDueSince: string | null;
  failedChargeAttempts: number;
  nextChargeAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan: IPlan;
  organization: ISubscriptionOrganization;
}

export interface IGetSubscriptionsFilter {
  page?: number;
  limit?: number;
  status?: string;
  tier?: string;
  search?: string;
}

/** One row of the global payment ledger. */
export interface ISubscriptionPaymentRecord {
  id: string;
  organizationId: string;
  subscriptionId: string;
  planId: string;
  /** Decimal strings, e.g. "15000.00". */
  amount: string;
  discountAmount: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string;
  /** BANK_TRANSFER, CASH, PAYSTACK_CARD, PAYSTACK_BANK_TRANSFER, PROMO, … */
  method: string | null;
  reference: string | null;
  note: string | null;
  /** Platform admin who logged a manual payment; null for Paystack and promo payments. */
  recordedById: string | null;
  promoCodeId: string | null;
  checkoutId: string | null;
  createdAt: string;
  updatedAt: string;
  plan: { id: string; tier: string; name: string };
  organization: ISubscriptionOrganization;
  recordedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface IGetSubscriptionPaymentsFilter {
  page?: number;
  limit?: number;
  organizationId?: string;
  tier?: string;
  /** ISO date-times; paidAt is matched inclusively. */
  from?: string;
  to?: string;
  search?: string;
}

/** What one run of the daily billing job did. */
export interface IBillingRunSummary {
  reminders: number;
  renewed: number;
  pastDue: number;
  retried: number;
  expired: number;
  movedToStarter: number;
  abandoned: number;
  errors: number;
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string;
  monthlyPrice?: number;
  currency?: string;
  isActive?: boolean;
}
