/**
 * Platform-wide back-office analytics.
 * Mirrors `GET /back-office/analytics` (BackOfficeAnalyticsService.getOverview).
 */

/** Query params for the overview endpoint. */
export interface IOverviewFilter {
  /** Start of the reporting period (ISO date). Defaults to start of this month. */
  from?: string;
  /** End of the reporting period (ISO date). Defaults to now. */
  to?: string;
  /** Months in the growth trend series (1–36). Default 12. */
  trendMonths?: number;
}

export interface IOverviewPeriod {
  from: string;
  to: string;
}

export interface IOverviewOrganizations {
  total: number;
  active: number;
  inactive: number;
  newInPeriod: number;
  /** Orgs that created at least one activity record in the period. */
  activeInPeriod: number;
  /** Orgs with no activity record in the last 30 days. */
  dormantLast30Days: number;
}

export interface IOverviewUsers {
  total: number;
  newInPeriod: number;
}

/** All-time record counts across the platform. */
export interface IOverviewPlatformTotals {
  clients: number;
  vehicles: number;
  inspections: number;
  invoices: number;
  jobCards: number;
}

/** Records created within the selected period. */
export interface IOverviewActivity {
  inspections: number;
  invoices: number;
  paymentsReceived: number;
  expenses: number;
  jobCards: number;
}

/**
 * Money is grouped by currency rather than summed — orgs on the platform bill
 * in different currencies, so a single total would be meaningless.
 */
export interface IOverviewMoneyByCurrency {
  currency: string;
  amount: number;
  count: number;
}

export interface IOverviewMoney {
  invoiced: IOverviewMoneyByCurrency[];
  collected: IOverviewMoneyByCurrency[];
}

export interface IOverviewSubscriptionStatus {
  status: string;
  count: number;
}

export interface IOverviewSubscriptionPlan {
  tier: string | null;
  name: string;
  count: number;
}

export interface IOverviewSubscriptions {
  byStatus: IOverviewSubscriptionStatus[];
  byPlan: IOverviewSubscriptionPlan[];
}

/** One point of the monthly growth series; `month` is a 'YYYY-MM' key. */
export interface IOverviewTrendPoint {
  month: string;
  newOrganizations: number;
  newUsers: number;
  inspections: number;
  invoices: number;
}

export interface IOverviewTopActiveOrg {
  id: string;
  name: string;
  slug: string | null;
  activityCount: number;
  /** Per-table split, e.g. `{ invoices: 12, jobCards: 4 }`. */
  breakdown: Record<string, number>;
}

export interface IOverviewRecentOrganization {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  userCount: number;
}

export interface IOverviewResponse {
  period: IOverviewPeriod;
  organizations: IOverviewOrganizations;
  users: IOverviewUsers;
  platformTotals: IOverviewPlatformTotals;
  activityInPeriod: IOverviewActivity;
  money: IOverviewMoney;
  subscriptions: IOverviewSubscriptions;
  trend: IOverviewTrendPoint[];
  topActiveOrgs: IOverviewTopActiveOrg[];
  recentOrganizations: IOverviewRecentOrganization[];
}
