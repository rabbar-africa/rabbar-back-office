import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MutationConfig, QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import {
  organizationsService,
  organizationAddressService,
  organizationBankAccountService,
  organizationTransactionSeriesService,
  organizationsSubscriptionService,
} from './service';
import type { IGetOrganizationsFilter } from './types';

export function useGetOrganizations(
  filter?: IGetOrganizationsFilter,
  config?: QueryConfigType<typeof organizationsService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.organizations.getAll, filter],
    queryFn: () => organizationsService.getAll(filter),
    ...config,
  });
}

export function useGetOrganizationById(
  id: string,
  config?: QueryConfigType<typeof organizationsService.getById>
) {
  return useQuery({
    queryKey: [customQueryKey.organizations.getById, id],
    queryFn: () => organizationsService.getById(id),
    enabled: !!id,
    ...config,
  });
}

export function useCreateOrganization(
  config?: MutationConfig<typeof organizationsService.create>
) {
  return useMutation({
    mutationFn: organizationsService.create,
    meta: {
      successMessage: 'Organization created successfully',
      invalidatesQuery: [customQueryKey.organizations.getAll],
    },
    ...config,
  });
}

export function useUpdateOrganization(
  config?: MutationConfig<typeof organizationsService.update>
) {
  return useMutation({
    mutationFn: organizationsService.update,
    meta: {
      successMessage: 'Organization updated successfully',
      invalidatesQuery: [customQueryKey.organizations.getAll],
    },
    ...config,
  });
}

export function useDeleteOrganization(
  config?: MutationConfig<typeof organizationsService.remove>
) {
  return useMutation({
    mutationFn: organizationsService.remove,
    meta: {
      successMessage: 'Organization deleted successfully',
      invalidatesQuery: [customQueryKey.organizations.getAll],
    },
    ...config,
  });
}

/**
 * Invalidate both the list and any open detail query after a status/config
 * change so the header badge and the table row stay in sync.
 */
function useInvalidateOrganization() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.organizations.getAll],
    });
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.organizations.getById],
    });
  };
}

export function useActivateOrganization(
  config?: MutationConfig<typeof organizationsService.activate>
) {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: organizationsService.activate,
    meta: { successMessage: 'Organization activated successfully' },
    onSuccess: invalidate,
    ...config,
  });
}

export function useDeactivateOrganization(
  config?: MutationConfig<typeof organizationsService.deactivate>
) {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: organizationsService.deactivate,
    meta: { successMessage: 'Organization deactivated successfully' },
    onSuccess: invalidate,
    ...config,
  });
}

export function useUpdateOrganizationLogo(
  config?: MutationConfig<typeof organizationsService.updateLogo>
) {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: organizationsService.updateLogo,
    meta: { successMessage: 'Logo updated successfully' },
    onSuccess: invalidate,
    ...config,
  });
}

export function useSeedOrganizationDefaults(
  config?: MutationConfig<typeof organizationsService.seedDefaults>
) {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: organizationsService.seedDefaults,
    meta: { successMessage: 'Default configuration seeded successfully' },
    onSuccess: invalidate,
    ...config,
  });
}

/* ── Addresses ─────────────────────────────────────────────────────────── */

export function useGetOrganizationAddresses(
  id: string,
  config?: QueryConfigType<typeof organizationAddressService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.organizations.getAddresses, id],
    queryFn: () => organizationAddressService.getAll(id),
    enabled: !!id,
    ...config,
  });
}

export function useCreateOrganizationAddress(
  config?: MutationConfig<typeof organizationAddressService.create>
) {
  return useMutation({
    mutationFn: organizationAddressService.create,
    meta: {
      successMessage: 'Address added successfully',
      invalidatesQuery: [customQueryKey.organizations.getAddresses],
    },
    ...config,
  });
}

export function useUpdateOrganizationAddress(
  config?: MutationConfig<typeof organizationAddressService.update>
) {
  return useMutation({
    mutationFn: organizationAddressService.update,
    meta: {
      successMessage: 'Address updated successfully',
      invalidatesQuery: [customQueryKey.organizations.getAddresses],
    },
    ...config,
  });
}

export function useDeleteOrganizationAddress(
  config?: MutationConfig<typeof organizationAddressService.remove>
) {
  return useMutation({
    mutationFn: organizationAddressService.remove,
    meta: {
      successMessage: 'Address removed successfully',
      invalidatesQuery: [customQueryKey.organizations.getAddresses],
    },
    ...config,
  });
}

export function useSetPrimaryOrganizationAddress(
  config?: MutationConfig<typeof organizationAddressService.setPrimary>
) {
  return useMutation({
    mutationFn: organizationAddressService.setPrimary,
    meta: {
      successMessage: 'Primary address updated',
      invalidatesQuery: [customQueryKey.organizations.getAddresses],
    },
    ...config,
  });
}

/* ── Bank accounts ─────────────────────────────────────────────────────── */

export function useGetOrganizationBankAccounts(
  id: string,
  config?: QueryConfigType<typeof organizationBankAccountService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.organizations.getBankAccounts, id],
    queryFn: () => organizationBankAccountService.getAll(id),
    enabled: !!id,
    ...config,
  });
}

export function useCreateOrganizationBankAccount(
  config?: MutationConfig<typeof organizationBankAccountService.create>
) {
  return useMutation({
    mutationFn: organizationBankAccountService.create,
    meta: {
      successMessage: 'Bank account added successfully',
      invalidatesQuery: [customQueryKey.organizations.getBankAccounts],
    },
    ...config,
  });
}

export function useUpdateOrganizationBankAccount(
  config?: MutationConfig<typeof organizationBankAccountService.update>
) {
  return useMutation({
    mutationFn: organizationBankAccountService.update,
    meta: {
      successMessage: 'Bank account updated successfully',
      invalidatesQuery: [customQueryKey.organizations.getBankAccounts],
    },
    ...config,
  });
}

export function useDeleteOrganizationBankAccount(
  config?: MutationConfig<typeof organizationBankAccountService.remove>
) {
  return useMutation({
    mutationFn: organizationBankAccountService.remove,
    meta: {
      successMessage: 'Bank account removed successfully',
      invalidatesQuery: [customQueryKey.organizations.getBankAccounts],
    },
    ...config,
  });
}

export function useSetPrimaryOrganizationBankAccount(
  config?: MutationConfig<typeof organizationBankAccountService.setPrimary>
) {
  return useMutation({
    mutationFn: organizationBankAccountService.setPrimary,
    meta: {
      successMessage: 'Primary bank account updated',
      invalidatesQuery: [customQueryKey.organizations.getBankAccounts],
    },
    ...config,
  });
}

/* ── Transaction series ────────────────────────────────────────────────── */

export function useGetOrganizationTransactionSeries(
  id: string,
  config?: QueryConfigType<typeof organizationTransactionSeriesService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.organizations.getTransactionSeries, id],
    queryFn: () => organizationTransactionSeriesService.getAll(id),
    enabled: !!id,
    ...config,
  });
}

export function useUpsertOrganizationTransactionSeries(
  config?: MutationConfig<typeof organizationTransactionSeriesService.upsert>
) {
  return useMutation({
    mutationFn: organizationTransactionSeriesService.upsert,
    meta: {
      successMessage: 'Transaction series saved successfully',
      invalidatesQuery: [customQueryKey.organizations.getTransactionSeries],
    },
    ...config,
  });
}

export function useDeleteOrganizationTransactionSeries(
  config?: MutationConfig<typeof organizationTransactionSeriesService.remove>
) {
  return useMutation({
    mutationFn: organizationTransactionSeriesService.remove,
    meta: {
      successMessage: 'Transaction series removed successfully',
      invalidatesQuery: [customQueryKey.organizations.getTransactionSeries],
    },
    ...config,
  });
}

/* ── Subscription & plans ──────────────────────────────────────────────── */

function useInvalidateSubscription() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.subscriptions.getByOrg],
    });
}

export function useGetOrganizationSubscription(
  id: string,
  config?: QueryConfigType<
    typeof organizationsSubscriptionService.getSubscription
  >
) {
  return useQuery({
    queryKey: [customQueryKey.subscriptions.getByOrg, id],
    queryFn: () => organizationsSubscriptionService.getSubscription(id),
    enabled: !!id,
    ...config,
  });
}

export function useGetPlans(
  config?: QueryConfigType<typeof organizationsSubscriptionService.getPlans>
) {
  return useQuery({
    queryKey: [customQueryKey.plans.getAll],
    queryFn: () => organizationsSubscriptionService.getPlans(),
    ...config,
  });
}

export function useCreateManualSubscription(
  config?: MutationConfig<
    typeof organizationsSubscriptionService.createManualSubscription
  >
) {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: organizationsSubscriptionService.createManualSubscription,
    meta: { successMessage: 'Payment recorded successfully' },
    onSuccess: invalidate,
    ...config,
  });
}

export function useCancelSubscription(
  config?: MutationConfig<
    typeof organizationsSubscriptionService.cancelSubscription
  >
) {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: organizationsSubscriptionService.cancelSubscription,
    meta: { successMessage: 'Subscription cancelled' },
    onSuccess: invalidate,
    ...config,
  });
}

export function useReactivateSubscription(
  config?: MutationConfig<
    typeof organizationsSubscriptionService.reactivateCancelledSubscription
  >
) {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn:
      organizationsSubscriptionService.reactivateCancelledSubscription,
    meta: { successMessage: 'Subscription reactivated' },
    onSuccess: invalidate,
    ...config,
  });
}
