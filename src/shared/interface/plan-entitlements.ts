/**
 * What a plan includes, and terms agreed with one business. Mirrors
 * `GET /back-office/plans`, `GET /back-office/plans/catalog`,
 * `PATCH /back-office/plans/:id/entitlements` and
 * `GET/PATCH/DELETE /back-office/subscriptions/:organizationId/entitlements`.
 */

export type LimitPeriod = 'total' | 'month';

export interface LimitRule {
  /** Null: no cap. */
  max: number | null;
  /** 'total': all of them ever. 'month': created this calendar month (Lagos). */
  per: LimitPeriod;
}

/** On/off things a plan can include, in catalog order. */
export interface IPlanFeatureRow {
  key: string;
  label: string;
  included: boolean;
  /** On the price list but not built yet: nothing checks it. */
  comingSoon: boolean;
}

/** Counted things a plan can cap, in catalog order. */
export interface IPlanLimitRow {
  key: string;
  label: string;
  max: number | null;
  per: LimitPeriod;
  /** Ready to print, e.g. "100 invoices a month". */
  phrase: string;
  comingSoon: boolean;
}

export interface IEntitlementRows {
  features: IPlanFeatureRow[];
  limits: IPlanLimitRow[];
}

/** A plan's (or a business's) entitlements as plain values. */
export interface PlanEntitlements {
  features: Record<string, boolean>;
  limits: Record<string, LimitRule>;
}

export interface IPlanCatalog {
  features: Record<string, { label: string; status: 'live' | 'planned' }>;
  limits: Record<
    string,
    {
      label: string;
      one: string;
      many: string;
      status: 'live' | 'planned';
      /** Counted per document type (templates): `per` does not apply. */
      perDocumentType?: boolean;
    }
  >;
  periods: LimitPeriod[];
  /** Each tier as shipped, before anything was changed here. */
  defaults: Record<string, PlanEntitlements>;
}

/**
 * Only what changes. Anything left out keeps its value; null puts it back
 * (to the plan's default, or for a business to its plan).
 */
export interface EntitlementChanges {
  features?: Record<string, boolean | null>;
  limits?: Record<string, LimitRule | null>;
}

export interface UpdateOrgEntitlementsPayload extends EntitlementChanges {
  /** Back office only. Left out keeps it; null clears it. */
  note?: string | null;
}

export interface IOrgEntitlements {
  organizationId: string;
  planOnFile: string;
  /** What the business is treated as now: Starter while a plan has lapsed. */
  effectiveTier: string;
  terms: {
    /** The plan the terms were agreed for; null when there are none. */
    agreedFor: string | null;
    overrides: Partial<PlanEntitlements>;
    note: string | null;
    updatedAt: string | null;
    updatedById: string | null;
    /** In force now: the business is on the plan they were agreed for. */
    applies: boolean;
    /** Agreed for a plan the business is no longer on. */
    stale: boolean;
  };
  /** The plan on file, as it is for everyone on it. */
  plan: IEntitlementRows;
  /** What this business can do now. */
  effective: IEntitlementRows;
}
