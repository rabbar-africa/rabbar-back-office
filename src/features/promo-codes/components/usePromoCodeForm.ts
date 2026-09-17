import { useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import type {
  CreatePromoCodePayload,
  IPromoCode,
  PlanTier,
  PromoDiscountType,
  UpdatePromoCodePayload,
} from '@/shared/interface/promo-code';

export interface PromoCodeFormValues {
  code: string;
  description: string;
  type: PromoDiscountType;
  value: string;
  durationMonths: string;
  planTiers: PlanTier[];
  maxRedemptions: string;
  newOrgsOnly: boolean;
  autoApplyOnSignup: boolean;
  /** 'YYYY-MM-DD' from the date input. */
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

const CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/;
const WHOLE_NUMBER = /^\d+$/;

const toDateInput = (iso?: string | null) =>
  iso ? moment(iso).format('YYYY-MM-DD') : '';

const startOfDay = (date: string) =>
  moment(date, 'YYYY-MM-DD').startOf('day').toISOString();
const endOfDay = (date: string) =>
  moment(date, 'YYYY-MM-DD').endOf('day').toISOString();

export function toFormValues(promo?: IPromoCode | null): PromoCodeFormValues {
  return {
    code: promo?.code ?? '',
    description: promo?.description ?? '',
    type: promo?.type ?? 'FREE_MONTHS',
    value:
      promo && promo.type !== 'FREE_MONTHS' ? String(Number(promo.value)) : '',
    durationMonths: promo ? String(promo.durationMonths) : '',
    planTiers: promo?.planTiers ?? [],
    maxRedemptions:
      promo?.maxRedemptions != null ? String(promo.maxRedemptions) : '',
    newOrgsOnly: promo?.newOrgsOnly ?? true,
    autoApplyOnSignup: promo?.autoApplyOnSignup ?? false,
    startsAt: toDateInput(promo?.startsAt),
    expiresAt: toDateInput(promo?.expiresAt),
    isActive: promo?.isActive ?? true,
  };
}

/**
 * Mirrors the API's validation (CreatePromoCodeDto + assertValidShape) so most
 * mistakes are caught before a round trip.
 *
 * On edit, a usage cap or date that is already set can be changed but not
 * cleared — the PATCH endpoint ignores empty values — so blanking one is
 * flagged here instead of silently doing nothing.
 */
function buildSchema(promo?: IPromoCode | null) {
  const isEdit = Boolean(promo);
  const hadCap = promo?.maxRedemptions != null;
  const hadStart = Boolean(promo?.startsAt);
  const hadExpiry = Boolean(promo?.expiresAt);

  return Yup.object({
    code: isEdit
      ? Yup.string()
      : Yup.string()
          .trim()
          .required('Enter a code')
          .matches(CODE_PATTERN, 'Use 3–32 letters, numbers, - or _ only'),
    type: Yup.string()
      .oneOf(['FREE_MONTHS', 'PERCENT', 'FIXED'])
      .required('Choose a discount type'),
    value: Yup.string().test('value-by-type', function (raw) {
      const { type } = this.parent as PromoCodeFormValues;
      const n = Number(raw);
      if (type === 'PERCENT' && !(raw && n >= 1 && n <= 100))
        return this.createError({
          message: 'Enter a percentage between 1 and 100',
        });
      if (type === 'FIXED' && !(raw && n > 0))
        return this.createError({
          message: 'Enter the amount to take off each month',
        });
      return true;
    }),
    durationMonths: Yup.string()
      .required('Enter the number of months')
      .matches(WHOLE_NUMBER, 'Enter a whole number')
      .test('duration-range', 'Enter between 1 and 36 months', (v) => {
        const n = Number(v);
        return n >= 1 && n <= 36;
      }),
    planTiers: Yup.array()
      .of(Yup.string())
      .test('plans-by-type', function (tiers) {
        const { type } = this.parent as PromoCodeFormValues;
        if (type === 'FREE_MONTHS' && tiers?.length !== 1)
          return this.createError({
            message: 'Choose the plan to give for free',
          });
        return true;
      }),
    maxRedemptions: Yup.string().test('max-uses', function (raw) {
      if (!raw)
        return hadCap
          ? this.createError({
              message:
                'A usage limit can be changed but not removed — enter a number',
            })
          : true;
      if (!WHOLE_NUMBER.test(raw) || Number(raw) < 1)
        return this.createError({
          message: 'Enter a whole number of 1 or more',
        });
      return true;
    }),
    startsAt: Yup.string().test(
      'start-kept',
      'A start date can be moved but not removed',
      (v) => !(hadStart && !v)
    ),
    expiresAt: Yup.string().test('expiry', function (v) {
      const { startsAt } = this.parent as PromoCodeFormValues;
      if (hadExpiry && !v)
        return this.createError({
          message: 'An expiry date can be moved but not removed',
        });
      if (v && startsAt && v < startsAt)
        return this.createError({
          message: "The expiry date can't be before the start date",
        });
      return true;
    }),
  });
}

const optionalInt = (raw: string) => (raw ? Number(raw) : undefined);

export function toCreatePayload(
  values: PromoCodeFormValues
): CreatePromoCodePayload {
  return {
    code: values.code.trim().toUpperCase(),
    description: values.description.trim() || undefined,
    type: values.type,
    ...(values.type !== 'FREE_MONTHS' ? { value: Number(values.value) } : {}),
    durationMonths: Number(values.durationMonths),
    planTiers: values.planTiers,
    maxRedemptions: optionalInt(values.maxRedemptions),
    newOrgsOnly: values.newOrgsOnly,
    autoApplyOnSignup: values.autoApplyOnSignup,
    startsAt: values.startsAt ? startOfDay(values.startsAt) : undefined,
    expiresAt: values.expiresAt ? endOfDay(values.expiresAt) : undefined,
    isActive: values.isActive,
  };
}

export function toUpdatePayload(
  values: PromoCodeFormValues,
  initial: PromoCodeFormValues
): UpdatePromoCodePayload {
  return {
    description: values.description.trim(),
    ...(values.type !== 'FREE_MONTHS' ? { value: Number(values.value) } : {}),
    durationMonths: Number(values.durationMonths),
    planTiers: values.planTiers,
    maxRedemptions: optionalInt(values.maxRedemptions),
    newOrgsOnly: values.newOrgsOnly,
    autoApplyOnSignup: values.autoApplyOnSignup,
    isActive: values.isActive,
    // Only send dates that changed: the picker is day-only, so re-sending an
    // untouched date would snap its stored time to the start/end of the day.
    ...(values.startsAt && values.startsAt !== initial.startsAt
      ? { startsAt: startOfDay(values.startsAt) }
      : {}),
    ...(values.expiresAt && values.expiresAt !== initial.expiresAt
      ? { expiresAt: endOfDay(values.expiresAt) }
      : {}),
  };
}

interface UsePromoCodeFormOptions {
  /** Existing code to edit; omit to create. */
  promo?: IPromoCode | null;
  onSubmit: (values: PromoCodeFormValues, initial: PromoCodeFormValues) => void;
}

export function usePromoCodeForm({ promo, onSubmit }: UsePromoCodeFormOptions) {
  const initialValues = useMemo(() => toFormValues(promo), [promo]);
  const validationSchema = useMemo(() => buildSchema(promo), [promo]);

  return useFormik<PromoCodeFormValues>({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    validateOnChange: false,
    onSubmit: (values) => onSubmit(values, initialValues),
  });
}

export type PromoCodeFormik = ReturnType<typeof usePromoCodeForm>;
