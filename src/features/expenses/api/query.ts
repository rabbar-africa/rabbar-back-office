import { useQuery } from '@tanstack/react-query';
import type { QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IGetExpensesFilter } from '@/shared/interface/expense';
import { expensesService } from './service';

export function useGetExpenses(
  filter?: IGetExpensesFilter,
  config?: QueryConfigType<typeof expensesService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.expenses.getAll, filter],
    queryFn: () => expensesService.getAll(filter),
    ...config,
  });
}
