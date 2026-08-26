import { useQuery, type QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IGetInspectionsFilter } from '@/shared/interface/inspection';
import { getInspectionById, getInspections } from './service';

export const useGetInspectionsQuery = (
  filter?: IGetInspectionsFilter,
  config?: QueryConfigType<typeof getInspections>
) =>
  useQuery({
    queryKey: [customQueryKey.inspections.getAll, filter],
    queryFn: () => getInspections(filter),
    ...config,
  });

export const useGetInspectionByIdQuery = (
  id: string,
  config?: QueryConfigType<typeof getInspectionById>
) =>
  useQuery({
    queryKey: [customQueryKey.inspections.getById, id],
    queryFn: () => getInspectionById(id),
    enabled: Boolean(id),
    ...config,
  });
