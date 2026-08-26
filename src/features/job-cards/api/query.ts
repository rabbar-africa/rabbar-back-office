import { useQuery, type QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IGetJobCardsFilter } from '@/shared/interface/job-card';
import { getJobCards } from './service';

export const useGetJobCardsQuery = (
  filter?: IGetJobCardsFilter,
  config?: QueryConfigType<typeof getJobCards>
) =>
  useQuery({
    queryKey: [customQueryKey.jobCards.getAll, filter],
    queryFn: () => getJobCards(filter),
    ...config,
  });
