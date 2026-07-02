import { useQuery } from '@tanstack/react-query';
import type { QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IGetPaymentsReceivedFilter } from '@/shared/interface/payment';
import { paymentsService } from './service';

export function useGetPayments(
  filter?: IGetPaymentsReceivedFilter,
  config?: QueryConfigType<typeof paymentsService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.payments.getAll, filter],
    queryFn: () => paymentsService.getAll(filter),
    ...config,
  });
}
