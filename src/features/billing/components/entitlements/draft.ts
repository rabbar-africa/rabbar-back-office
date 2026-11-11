import type {
  EntitlementChanges,
  IEntitlementRows,
  IPlanCatalog,
  LimitPeriod,
  LimitRule,
  PlanEntitlements,
} from '@/shared/interface/plan-entitlements';

/**
 * Editing a plan's entitlements, or one business's terms: the same form, with
 * a different "base" (what reset goes back to). For a plan the base is the
 * shipped default; for a business it is its plan.
 */

/** A limit as the form holds it: the number as typed. */
export interface LimitDraft {
  max: string;
  unlimited: boolean;
  per: LimitPeriod;
}

export interface EntitlementsDraft {
  features: Record<string, boolean>;
  limits: Record<string, LimitDraft>;
}

export const fromRows = (rows: IEntitlementRows): PlanEntitlements => ({
  features: Object.fromEntries(rows.features.map((r) => [r.key, r.included])),
  limits: Object.fromEntries(
    rows.limits.map((r) => [r.key, { max: r.max, per: r.per }])
  ),
});

/** `base` with stored overrides laid over it; unknown keys are ignored. */
export function withOverrides(
  base: PlanEntitlements,
  overrides?: Partial<PlanEntitlements> | null
): PlanEntitlements {
  const features = { ...base.features };
  const limits = { ...base.limits };
  for (const [key, value] of Object.entries(overrides?.features ?? {})) {
    if (key in features && typeof value === 'boolean') features[key] = value;
  }
  for (const [key, value] of Object.entries(overrides?.limits ?? {})) {
    if (key in limits && value) limits[key] = value;
  }
  return { features, limits };
}

export const toDraft = (value: PlanEntitlements): EntitlementsDraft => ({
  features: { ...value.features },
  limits: Object.fromEntries(
    Object.entries(value.limits).map(([key, rule]) => [key, toLimitDraft(rule)])
  ),
});

export const toLimitDraft = (rule: LimitRule): LimitDraft => ({
  max: rule.max === null ? '' : String(rule.max),
  unlimited: rule.max === null,
  per: rule.per,
});

/** The form's values, or what is wrong with each limit (by key). */
export function parseDraft(
  draft: EntitlementsDraft
):
  | { ok: true; value: PlanEntitlements }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const limits: Record<string, LimitRule> = {};
  for (const [key, limit] of Object.entries(draft.limits)) {
    if (limit.unlimited) {
      limits[key] = { max: null, per: limit.per };
      continue;
    }
    const typed = limit.max.trim();
    if (!/^\d+$/.test(typed)) {
      errors[key] = 'Enter a whole number, or tick No cap';
      continue;
    }
    limits[key] = { max: Number(typed), per: limit.per };
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { features: { ...draft.features }, limits } };
}

export const sameRule = (a?: LimitRule, b?: LimitRule) =>
  Boolean(a && b && a.max === b.max && a.per === b.per);

/**
 * What to send: only entries that changed since the form opened. One that
 * ends up back at the base is sent as null, so nothing is stored for it.
 */
export function changesBetween(
  initial: PlanEntitlements,
  next: PlanEntitlements,
  base: PlanEntitlements
): { changes: EntitlementChanges; count: number } {
  const features: Record<string, boolean | null> = {};
  const limits: Record<string, LimitRule | null> = {};
  for (const [key, value] of Object.entries(next.features)) {
    if (value === initial.features[key]) continue;
    features[key] = value === base.features[key] ? null : value;
  }
  for (const [key, rule] of Object.entries(next.limits)) {
    if (sameRule(rule, initial.limits[key])) continue;
    limits[key] = sameRule(rule, base.limits[key]) ? null : rule;
  }
  const count = Object.keys(features).length + Object.keys(limits).length;
  return {
    changes: {
      ...(Object.keys(features).length ? { features } : {}),
      ...(Object.keys(limits).length ? { limits } : {}),
    },
    count,
  };
}

/** How many entries differ from the base. */
export function differences(value: PlanEntitlements, base: PlanEntitlements) {
  const features = Object.keys(value.features).filter(
    (key) => value.features[key] !== base.features[key]
  );
  const limits = Object.keys(value.limits).filter(
    (key) => !sameRule(value.limits[key], base.limits[key])
  );
  return { features, limits, count: features.length + limits.length };
}

/**
 * "15 invoices", "100 invoices a month", "30,000 invoices a year". Mirrors
 * `limitPhrase` on the API, for values that have not been saved yet.
 */
export function limitPhrase(
  rule: LimitRule,
  meta: IPlanCatalog['limits'][string]
): string {
  if (rule.max === null) return `Unlimited ${meta.many}`;
  const count = `${rule.max.toLocaleString('en-US')} ${rule.max === 1 ? meta.one : meta.many}`;
  if (meta.perDocumentType) return `${count} per document type`;
  if (rule.per === 'month') return `${count} a month`;
  if (rule.per === 'year') return `${count} a year`;
  return count;
}

export const PERIOD_LABELS: Record<LimitPeriod, string> = {
  total: 'In total',
  month: 'A month',
  year: 'A year',
};
