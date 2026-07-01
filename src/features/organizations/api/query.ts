import { useMutation, useQuery } from '@tanstack/react-query';
import type { MutationConfig, QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import { organizationsService } from './service';
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
