import moment from 'moment';
import { getErrorMessage } from '@/utils/handle-error';
import type {
  IPromoCode,
  IPromoRedemption,
  PromoDiscountType,
  PromoRedemptionStatus,
} from '@/shared/interface/promo-code';

export const PROMO_TYPE_OPTIONS: Array<{
  value: PromoDiscountType;
  title: string;
  description: string;
}> = [
  {
    value: 'FREE_MONTHS',
    title: 'Free months',
    description:
      'A paid plan free for a set number of months — nothing to pay.',
  },
  {
    value: 'PERCENT',
    title: 'Percent off',
    description:
      'A percentage off each monthly payment, for a set number of payments.',
  },
  {
    value: 'FIXED',
    title: 'Amount off',
    description:
      'A fixed ₦ amount off each monthly payment, for a set number of payments.',
  },
];

export const PROMO_STATUS_FILTER_OPTIONS = [
  { label: 'All codes', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export const REDEMPTION_STATUS_LABELS: Record<PromoRedemptionStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export const pluralMonths = (n: number) => `${n} month${n === 1 ? '' : 's'}`;

export const formatNaira = (amount: number) =>
  `₦${amount.toLocaleString('en-NG')}`;

/** Plan tier → display name, from GET /back-office/plans. */
export type PlanNames = Record<string, string>;

export const planLabel = (tier: string, planNames?: PlanNames) =>
  planNames?.[tier] ?? titleCase(tier);

type PromoShape = Pick<
  IPromoCode,
  'type' | 'value' | 'durationMonths' | 'planTiers'
>;

/**
 * Plain-language summary, e.g. "3 months free · Standard",
 * "20% off for 3 months · all paid plans", "₦5,000 off for 2 months · Premium".
 */
export function describePromo(promo: PromoShape, planNames?: PlanNames) {
  const plans = promo.planTiers.length
    ? promo.planTiers.map((tier) => planLabel(tier, planNames)).join(' / ')
    : 'all paid plans';
  const months = pluralMonths(promo.durationMonths);
  const value = Number(promo.value);

  switch (promo.type) {
    case 'FREE_MONTHS':
      return `${months} free · ${plans}`;
    case 'PERCENT':
      return `${value}% off for ${months} · ${plans}`;
    case 'FIXED':
      return `${formatNaira(value)} off for ${months} · ${plans}`;
    default:
      return promo.type;
  }
}

export const describeUses = (
  promo: Pick<IPromoCode, 'redemptionCount' | 'maxRedemptions'>
) => `${promo.redemptionCount} / ${promo.maxRedemptions ?? 'unlimited'}`;

const formatDate = (iso: string) => moment(iso).format('DD MMM YYYY');

export function describeValidity(
  promo: Pick<IPromoCode, 'startsAt' | 'expiresAt'>
) {
  if (promo.startsAt && promo.expiresAt)
    return `${formatDate(promo.startsAt)} – ${formatDate(promo.expiresAt)}`;
  if (promo.startsAt) return `From ${formatDate(promo.startsAt)}`;
  if (promo.expiresAt) return `Until ${formatDate(promo.expiresAt)}`;
  return 'No end date';
}

export type PromoWindowState = 'scheduled' | 'expired' | 'open';

export function promoWindowState(
  promo: Pick<IPromoCode, 'startsAt' | 'expiresAt'>,
  now = new Date()
): PromoWindowState {
  if (promo.expiresAt && new Date(promo.expiresAt) < now) return 'expired';
  if (promo.startsAt && new Date(promo.startsAt) > now) return 'scheduled';
  return 'open';
}

/** What's left of one organization's discount. */
export function describeRemaining(
  promo: Pick<IPromoCode, 'type' | 'durationMonths'>,
  redemption: Pick<IPromoRedemption, 'status' | 'remainingCycles'>
) {
  if (redemption.status === 'CANCELLED') return '—';
  // FREE_MONTHS is one grant covering `durationMonths`; 1 cycle = not used yet.
  if (promo.type === 'FREE_MONTHS')
    return redemption.remainingCycles > 0
      ? `${pluralMonths(promo.durationMonths)} free — not used yet`
      : 'Used';
  return `${redemption.remainingCycles} of ${promo.durationMonths}`;
}

export const createdByName = (promo: Pick<IPromoCode, 'createdBy'>) =>
  promo.createdBy
    ? `${promo.createdBy.firstName ?? ''} ${promo.createdBy.lastName ?? ''}`.trim() ||
      '—'
    : '—';

/** Nest returns validation failures as a string array — join them for display. */
export function apiErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  if (Array.isArray(message)) return message.join('. ');
  return message ? String(message) : 'Something went wrong. Please try again.';
}

export const apiErrorStatus = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;
