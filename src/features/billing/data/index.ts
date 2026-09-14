import moment from 'moment';
import type { IPlan } from '@/features/organizations/api/types';
import {
  FREE_PLAN_TIER,
  SUBSCRIPTION_GRACE_PERIOD_DAYS,
  SUBSCRIPTION_RENEWAL_REMINDER_DAYS,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/shared/constants/subscription';
import type {
  ISubscriptionListItem,
  ISubscriptionPaymentRecord,
} from '@/shared/interface/billing';

export const BILLING_TABS = [
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'payments', label: 'Payments' },
  { value: 'plans', label: 'Plans' },
] as const;

export type BillingTab = (typeof BILLING_TABS)[number]['value'];

export const SUBSCRIPTION_STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  ...Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

export const formatDate = (iso?: string | null) =>
  iso ? moment(iso).format('DD MMM YYYY') : '—';

export const describePeriod = (start?: string | null, end?: string | null) =>
  start && end ? `${formatDate(start)} – ${formatDate(end)}` : '—';

export const isFreePlan = (plan: Pick<IPlan, 'tier' | 'monthlyPrice'>) =>
  plan.tier === FREE_PLAN_TIER || Number(plan.monthlyPrice) <= 0;

/** Plan id → display name, from GET /back-office/plans. */
export type PlanNamesById = Record<string, string>;

export const planNamesById = (plans?: IPlan[]): PlanNamesById =>
  Object.fromEntries((plans ?? []).map((plan) => [plan.id, plan.name]));

export type RenewalTone = 'muted' | 'ok' | 'warning' | 'danger';

export interface RenewalSummary {
  label: string;
  tone: RenewalTone;
}

type RenewalShape = Pick<
  ISubscriptionListItem,
  | 'status'
  | 'currentPeriodEnd'
  | 'cancelledAt'
  | 'pastDueSince'
  | 'autoRenew'
  | 'cancelAtPeriodEnd'
  | 'pendingPlanId'
  | 'failedChargeAttempts'
> & { plan: Pick<IPlan, 'tier' | 'monthlyPrice'> };

/**
 * One line on what happens next for a subscription, e.g. "Auto-renews
 * 12 Oct 2026", "Payment due · grace ends 19 Oct 2026", "Switches to
 * Standard on 12 Oct 2026". Mirrors how the billing job treats the row.
 */
export function describeRenewal(
  sub: RenewalShape,
  planNames?: PlanNamesById,
  now = new Date()
): RenewalSummary {
  const end = sub.currentPeriodEnd;

  switch (sub.status) {
    case 'CANCELLED':
      return {
        label: `Cancelled ${formatDate(sub.cancelledAt)}`,
        tone: 'danger',
      };
    case 'EXPIRED':
      return { label: `Expired ${formatDate(end)}`, tone: 'danger' };
    case 'INACTIVE':
      return { label: 'Inactive', tone: 'muted' };
    case 'PAST_DUE': {
      const graceEnds = sub.pastDueSince
        ? moment(sub.pastDueSince).add(SUBSCRIPTION_GRACE_PERIOD_DAYS, 'days')
        : null;
      const retries = sub.failedChargeAttempts
        ? ` · ${sub.failedChargeAttempts} failed card charge${sub.failedChargeAttempts === 1 ? '' : 's'}`
        : '';
      return {
        label: graceEnds
          ? `Payment due · grace ends ${graceEnds.format('DD MMM YYYY')}${retries}`
          : `Payment due${retries}`,
        tone: 'danger',
      };
    }
  }

  if (isFreePlan(sub.plan)) return { label: 'Free plan', tone: 'muted' };
  if (!end) return { label: '—', tone: 'muted' };

  const daysLeft = moment(end).diff(moment(now), 'days');
  const soon = daysLeft <= SUBSCRIPTION_RENEWAL_REMINDER_DAYS;

  if (sub.cancelAtPeriodEnd)
    return { label: `Ends ${formatDate(end)} · cancelled`, tone: 'warning' };
  if (sub.pendingPlanId)
    return {
      label: `Switches to ${planNames?.[sub.pendingPlanId] ?? 'another plan'} on ${formatDate(end)}`,
      tone: 'warning',
    };
  if (sub.autoRenew)
    return { label: `Auto-renews ${formatDate(end)}`, tone: 'ok' };
  return {
    label: `Renews ${formatDate(end)} · pay manually`,
    tone: soon ? 'warning' : 'muted',
  };
}

export const RENEWAL_TONE_COLOR: Record<RenewalTone, string> = {
  muted: 'gray.400',
  ok: 'success.300',
  warning: 'secondary.500',
  danger: 'error.300',
};

/** Who logged a payment: a platform admin, or the system (Paystack, promo). */
export const recordedByName = (
  payment: Pick<ISubscriptionPaymentRecord, 'recordedBy' | 'method'>
) => {
  if (payment.recordedBy) {
    const name =
      `${payment.recordedBy.firstName ?? ''} ${payment.recordedBy.lastName ?? ''}`.trim();
    return name || payment.recordedBy.email || '—';
  }
  if (payment.method?.startsWith('PAYSTACK')) return 'Paystack';
  if (payment.method === 'PROMO') return 'Promo code';
  return 'System';
};

/** 'YYYY-MM-DD' from a date input → ISO bounds for the API's paidAt filter. */
export const dayStartIso = (date: string) =>
  moment(date, 'YYYY-MM-DD').startOf('day').toISOString();
export const dayEndIso = (date: string) =>
  moment(date, 'YYYY-MM-DD').endOf('day').toISOString();
