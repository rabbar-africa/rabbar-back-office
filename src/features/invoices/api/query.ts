import { useQuery } from '@tanstack/react-query';
import type { QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IGetInvoiceFilter } from '@/shared/interface/invoice';
import { invoicesService } from './service';

export function useGetInvoices(
  filter?: IGetInvoiceFilter,
  config?: QueryConfigType<typeof invoicesService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.invoices.getAll, filter],
    queryFn: () => invoicesService.getAll(filter),
    ...config,
  });
}
