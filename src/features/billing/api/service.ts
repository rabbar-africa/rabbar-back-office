import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type { IPlan } from '@/features/organizations/api/types';
import type {
  IBillingRunSummary,
  IGetSubscriptionPaymentsFilter,
  IGetSubscriptionsFilter,
  ISubscriptionListItem,
  ISubscriptionPaymentRecord,
  UpdatePlanPayload,
} from '@/shared/interface/billing';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

const SUBSCRIPTIONS_PATH = 'back-office/subscriptions';
const PLANS_PATH = 'back-office/plans';

/**
 * Cross-organization billing. Per-organization actions (record a payment,
 * change plan, cancel, reactivate) live with the organization feature.
 */
export const billingService = {
  /** Every organization's subscription, paginated. */
  getSubscriptions: async (filter?: IGetSubscriptionsFilter) => {
    const url = buildUrlWithQueryParams(SUBSCRIPTIONS_PATH, filter);
    const response = await axios.get<ApiResponse<ISubscriptionListItem[]>>(url);
    return response.data;
  },

  /** The global payment ledger across all organizations, paginated. */
  getPayments: async (filter?: IGetSubscriptionPaymentsFilter) => {
    const url = buildUrlWithQueryParams(
      `${SUBSCRIPTIONS_PATH}/payments`,
      filter
    );
    const response =
      await axios.get<ApiResponse<ISubscriptionPaymentRecord[]>>(url);
    return response.data;
  },

  /** Run the daily billing job now: reminders, renewals, card retries, expiries. */
  runBilling: async () => {
    const response = await axios.post<ApiResponse<IBillingRunSummary>>(
      `${SUBSCRIPTIONS_PATH}/run-billing`
    );
    return response.data;
  },

  /** Rename, reprice, or (de)activate a plan. The tier itself never changes. */
  updatePlan: async ({
    id,
    payload,
  }: {
    id: string;
    payload: UpdatePlanPayload;
  }) => {
    const response = await axios.patch<ApiResponse<IPlan>>(
      `${PLANS_PATH}/${id}`,
      payload
    );
    return response.data;
  },
};
