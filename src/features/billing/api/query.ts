import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MutationConfig, QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type {
  IGetSubscriptionPaymentsFilter,
  IGetSubscriptionsFilter,
} from '@/shared/interface/billing';
import { billingService } from './service';

export function useGetSubscriptions(
  filter?: IGetSubscriptionsFilter,
  config?: QueryConfigType<typeof billingService.getSubscriptions>
) {
  return useQuery({
    queryKey: [customQueryKey.subscriptions.getAll, filter],
    queryFn: () => billingService.getSubscriptions(filter),
    ...config,
  });
}

export function useGetSubscriptionPayments(
  filter?: IGetSubscriptionPaymentsFilter,
  config?: QueryConfigType<typeof billingService.getPayments>
) {
  return useQuery({
    queryKey: [customQueryKey.subscriptions.payments, filter],
    queryFn: () => billingService.getPayments(filter),
    ...config,
  });
}

/**
 * Run the daily billing job now. It can change any org's subscription and
 * write payments, so refresh every subscription view and the dashboard counts.
 */
export function useRunBilling(
  config?: MutationConfig<typeof billingService.runBilling>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: billingService.runBilling,
    onSuccess: () => {
      [
        customQueryKey.subscriptions.getAll,
        customQueryKey.subscriptions.getByOrg,
        customQueryKey.subscriptions.payments,
        customQueryKey.analytics.overview,
      ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
    ...config,
  });
}

/**
 * Plan prices show up in subscription rows, promo forms and the payment
 * modal, so refresh the catalog and the lists that embed it.
 */
export function useUpdatePlan(
  config?: MutationConfig<typeof billingService.updatePlan>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: billingService.updatePlan,
    meta: { successMessage: 'Plan updated' },
    onSuccess: () => {
      [
        customQueryKey.plans.getAll,
        customQueryKey.subscriptions.getAll,
        customQueryKey.subscriptions.getByOrg,
      ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
    ...config,
  });
}
