import type {
  IPlanFeatureRow,
  IPlanLimitRow,
} from '@/shared/interface/plan-entitlements';
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

/** Mirrors ORGANIZATION_SORT_FIELDS on the API. */
export type OrganizationSortField = 'name' | 'createdAt' | 'lastActivity';

export interface IGetOrganizationsFilter extends Omit<IBaseFilter, 'sortBy'> {
  industry?: string;
  isActive?: boolean;
  /** Default lastActivity: most recently active first. */
  sortBy?: OrganizationSortField;
  /** Default asc for name, desc for the dates. */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filters for one organization's records on the detail tabs. The organization
 * itself is passed separately — never as part of the filter — so it can't be
 * dropped by accident.
 */
export interface IOrgRecordsFilter extends Omit<IBaseFilter, 'organizationId'> {
  status?: string;
}

/* ── Permanent deletion ────────────────────────────────────────────────── */

/** Record counts that go with the organization. */
export interface IOrganizationDeletionSummary {
  users: number;
  customers: number;
  vehicles: number;
  invoices: number;
  paymentsReceived: number;
  jobCards: number;
  inspections: number;
  expenses: number;
}

/** Step 1 (POST :id/deletion-request): a code was emailed to the requesting admin. */
export interface IOrganizationDeletionRequest {
  requestId: string;
  organization: { id: string; name: string; slug: string };
  /** Masked address the code went to, e.g. "ay*****@rabbar.africa". */
  sentTo: string;
  expiresAt: string;
  expiresInMinutes: number;
  willDelete: IOrganizationDeletionSummary;
}

/** Step 2 (DELETE :id): the emailed code plus the organization's exact name. */
export interface ConfirmOrganizationDeletionPayload {
  otp: string;
  confirmName: string;
}

export interface IOrganizationDeletionResult {
  deleted: boolean;
  organization: { id: string; name: string; slug: string };
  removed: IOrganizationDeletionSummary;
  /** Reference for the audit trail. */
  auditId: string;
}

/* ── Subscriptions & plans ─────────────────────────────────────────────── */

export interface IPlan {
  id: string;
  tier: string;
  name: string;
  description: string | null;
  monthlyPrice: string;
  /** A year paid at once; null when the plan isn't sold by the year. */
  annualPrice?: number | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /**
   * Sold by talking to us (Enterprise): never at checkout, and its 0 price is
   * not a price. From GET /back-office/plans only.
   */
  contactSales?: boolean;
  contactUrl?: string | null;
  /** What the plan includes, from GET /back-office/plans only. */
  features?: IPlanFeatureRow[];
  limits?: IPlanLimitRow[];
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
  /**
   * How long the plan is given for: at most one of these. None means no end
   * date, which the API allows only for Starter (free, never ends).
   */
  durationDays?: number;
  durationMonths?: number;
  /** YYYY-MM-DD: through the end of that day, Lagos time. */
  endsAt?: string;
  /** When the time runs out: back to Starter (default) or ask them to pay. */
  whenEnds?: PlanGrantEnd;
}

export type PlanGrantEnd = 'starter' | 'renew';

export type BillingInterval = 'MONTHLY' | 'ANNUAL';

/**
 * Where the page after paying sends them first: WHATSAPP ("Back to
 * WhatsApp", the bot) or WEB ("Log in"). Nothing redirects by itself.
 */
export type PayLinkReturn = 'WHATSAPP' | 'WEB';

/** A payment link for one plan, sent to a business that can't pay itself. */
export interface CreatePayLinkPayload {
  planTier: string;
  billingInterval?: BillingInterval;
  /** Monthly only: a year is already the discount. */
  promoCode?: string;
  /** Days after today (Lagos) it still works: 1–30, default 7. */
  expiresInDays?: number;
  /**
   * Left out: WhatsApp when the owner has a number, else the web app.
   * WHATSAPP for an owner with no WhatsApp number is refused (400).
   */
  returnTo?: PayLinkReturn;
}

/** OPEN until paid, cancelled, or past its last day. */
export type PayLinkState = 'OPEN' | 'PAID' | 'CANCELLED' | 'EXPIRED';

/** One time the link was opened: each open is its own Paystack checkout. */
export interface IPayLinkCheckout {
  reference: string;
  /** PENDING | SUCCESS | FAILED | ABANDONED */
  status: string;
  amount: number;
  /** card | bank_transfer | ussd …, once paid */
  channel: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface IPayLink {
  id: string;
  /** The public pay page: no login needed. */
  url: string;
  state: PayLinkState;
  organizationName: string;
  plan: { tier: string; name: string };
  billingInterval: BillingInterval;
  promoCode: string | null;
  returnTo: PayLinkReturn;
  /** The end of the last Lagos day it works. */
  expiresAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  createdById: string | null;
  createdAt: string;
  /** From the list only. */
  checkouts?: IPayLinkCheckout[];
}

/** What making a link returns: the link, its price now, and who pays it. */
export interface ICreatedPayLink extends IPayLink {
  amount: number;
  discountAmount: number;
  currency: string;
  periodMonths: number;
  promoDescription: string | null;
  /** Who it is billed to: the first owner, else the business email. */
  payer: { email: string; whatsappNumber: string | null };
  /** Ready to paste into WhatsApp or an email; the link is in it. */
  shareText: string;
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
