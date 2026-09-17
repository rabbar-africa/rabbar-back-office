import type { IBaseFilter } from '@/shared/interface/filter';
import type { CreateOrgBankAccountPayload } from '@/shared/interface/settings';

export type UpdateOrgBankAccountPayload = Partial<CreateOrgBankAccountPayload>;

export interface CreateOrganizationPayload {
  name: string;
  slug?: string;
  email: string;
  companyEmail?: string;
  phone: string;
  phone2?: string | null;
  website?: string;
  industry?: string;
  rcNumber?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string | null;
  country?: string;
  postalCode?: string | null;
  currency?: string;
  timezone?: string;
  description?: string | null;
}

export type UpdateOrganizationPayload = Partial<CreateOrganizationPayload> & {
  isActive?: boolean;
};

export interface IGetOrganizationsFilter extends IBaseFilter {
  industry?: string;
  isActive?: boolean;
}

/**
 * Filters for one organization's records on the detail tabs. The organization
 * itself is passed separately — never as part of the filter — so it can't be
 * dropped by accident.
 */
export interface IOrgRecordsFilter extends Omit<IBaseFilter, 'organizationId'> {
  status?: string;
}

/* ── Subscriptions & plans ─────────────────────────────────────────────── */

export interface IPlan {
  id: string;
  tier: string;
  name: string;
  description: string | null;
  monthlyPrice: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISubscriptionPayment {
  id: string;
  organizationId: string;
  subscriptionId: string;
  planId: string;
  amount: string;
  /** Promo discount taken off this payment (decimal string); "0" when none. */
  discountAmount?: string | null;
  currency: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string;
  /** e.g. PAYSTACK_CARD, PAYSTACK_BANK_TRANSFER, PAYSTACK_USSD, PROMO, BANK_TRANSFER. */
  method: string;
  reference: string;
  note: string;
  recordedById: string;
  createdAt: string;
  updatedAt: string;
  plan: {
    tier: string;
    name: string;
  };
}

export interface IOrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  /** ACTIVE | PAST_DUE | EXPIRED | CANCELLED | INACTIVE */
  status: string;
  /** When the period ended unpaid (PAST_DUE only). */
  pastDueSince?: string | null;
  /** Charge the saved card automatically when the period ends. */
  autoRenew?: boolean;
  /** The org asked to stop: drops to Starter when the period ends. */
  cancelAtPeriodEnd?: boolean;
  /** A cheaper paid plan to switch to when the period ends. */
  pendingPlanId?: string | null;
  failedChargeAttempts?: number;
  nextChargeAttemptAt?: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  startedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan: IPlan;
  organization: {
    id: string;
    name: string;
    slug: string;
    companyEmail: string;
  };
  payments: ISubscriptionPayment[];
}

/** PATCH back-office/subscriptions/:organizationId/plan — no payment is recorded. */
export interface ChangePlanPayload {
  planTier: string;
  /** Optional context recorded with the change. */
  note?: string;
}

export interface CreateManualPaymentPayload {
  planTier: string;
  amount: number;
  currency: string;
  periodStart: string;
  periodMonths: number;
  paidAt: string;
  method: string;
  reference: string;
  note: string;
}
