import { useQuery, type QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IOverviewFilter } from '@/shared/interface/overview';
import { getOverview } from './service';

export const useGetOverviewQuery = (
  filter?: IOverviewFilter,
  config?: QueryConfigType<typeof getOverview>
) =>
  useQuery({
    queryKey: [customQueryKey.analytics.overview, filter],
    queryFn: () => getOverview(filter),
    ...config,
  });
