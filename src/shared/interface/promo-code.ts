import type { IBaseFilter } from './filter';

/**
 * Promo codes run from the back office.
 * Mirrors `GET/POST/PATCH /back-office/promo-codes` (PromoCodesService).
 */

export type PlanTier = 'STARTER' | 'STANDARD' | 'PREMIUM';

export type PromoDiscountType = 'FREE_MONTHS' | 'PERCENT' | 'FIXED';

export type PromoRedemptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface IPromoCode {
  id: string;
  code: string;
  description: string | null;
  type: PromoDiscountType;
  /** Decimal as a string, e.g. "20". PERCENT: % off; FIXED: ₦ off each month; "0" for FREE_MONTHS. */
  value: string;
  /** FREE_MONTHS: months given free. PERCENT/FIXED: monthly payments discounted. */
  durationMonths: number;
  /** Empty = every paid plan. FREE_MONTHS always names exactly one (the plan given). */
  planTiers: PlanTier[];
  /** Null = unlimited. */
  maxRedemptions: number | null;
  redemptionCount: number;
  newOrgsOnly: boolean;
  /** Applied to every new signup without a code. Only one code has this on at a time. */
  autoApplyOnSignup: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy: { id?: string; firstName: string; lastName: string } | null;
}

export interface IPromoRedemption {
  id: string;
  status: PromoRedemptionStatus;
  /** Discounted payments left. FREE_MONTHS is a single grant: 1 = not used yet. */
  remainingCycles: number;
  redeemedAt: string;
  organization: { id: string; name: string; slug: string };
}

export interface IPromoCodeDetail extends IPromoCode {
  redemptions: IPromoRedemption[];
}

export interface IGetPromoCodesFilter extends Pick<
  IBaseFilter,
  'page' | 'limit' | 'search'
> {
  isActive?: boolean;
}

export interface CreatePromoCodePayload {
  code: string;
  description?: string;
  type: PromoDiscountType;
  /** Omit for FREE_MONTHS. */
  value?: number;
  durationMonths: number;
  planTiers?: PlanTier[];
  /** Omit for unlimited. */
  maxRedemptions?: number;
  newOrgsOnly?: boolean;
  autoApplyOnSignup?: boolean;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

/** The code and discount type are fixed once created. */
export type UpdatePromoCodePayload = Partial<
  Omit<CreatePromoCodePayload, 'code' | 'type'>
>;
