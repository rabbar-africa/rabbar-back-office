import { useMutation, useQuery } from '@tanstack/react-query';
import type { MutationConfig, QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IBaseFilter } from '@/shared/interface/filter';
import { itemsService } from './service';

export function useGetItems(
  filter?: IBaseFilter,
  config?: QueryConfigType<typeof itemsService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.items.getAll, filter],
    queryFn: () => itemsService.getAll(filter),
    ...config,
  });
}

export function useCreateItemForOrganization(
  config?: MutationConfig<typeof itemsService.createForOrganization>
) {
  return useMutation({
    mutationFn: itemsService.createForOrganization,
    meta: {
      successMessage: 'Item created successfully',
      invalidatesQuery: [customQueryKey.items.getAll],
    },
    ...config,
  });
}
