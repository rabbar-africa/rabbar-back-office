import { useQuery } from '@tanstack/react-query';
import type { QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IBaseFilter } from '@/shared/interface/filter';
import { customersService } from './service';

export function useGetCustomers(
  filter?: IBaseFilter,
  config?: QueryConfigType<typeof customersService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.customers.getAll, filter],
    queryFn: () => customersService.getAll(filter),
    ...config,
  });
}
