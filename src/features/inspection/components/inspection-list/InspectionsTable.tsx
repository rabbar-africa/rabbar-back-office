import { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CustomTable } from '@/components/table';
import { CustomSelect } from '@/components/input/CustomSelect';
import { DateField } from '@/components/input/DateField';
import { SearchInput } from '@/components/input/SearchInput';
import { useUrlState } from '@/hooks/useUrlState';
import { RouteConstants } from '@/shared/constants/routes';
import { useGetInspectionsQuery } from '../../api';
import { INSPECTION_STATUS_OPTIONS, useInspectionColumns } from './columns';

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  status: { defaultValue: '' },
  dateFrom: { defaultValue: '' },
  dateTo: { defaultValue: '' },
};

interface InspectionsTableProps {
  /** Scopes the list to one organization and hides the Organization column. */
  organizationId?: string;
  /** Prefix for the URL filter params, so embedded tables don't collide. */
  urlPrefix?: string;
}

/**
 * The inspections list. Used both as the global cross-organization page and,
 * with `organizationId`, as the organization detail tab.
 */
export function InspectionsTable({
  organizationId,
  urlPrefix,
}: InspectionsTableProps) {
  const navigate = useNavigate();
  const scoped = Boolean(organizationId);
  const columns = useInspectionColumns({ showOrganization: !scoped });

  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: urlPrefix,
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isLoading, isFetching } = useGetInspectionsQuery({
    page: filters.page,
    limit: filters.limit,
    ...(organizationId ? { organizationId } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  });

  const inspections = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Flex direction="column" gap="1rem">
      <Flex
        gap="3"
        wrap="wrap"
        align={{ base: 'stretch', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <SearchInput
          placeholder="Search job code, customer, vehicle or technician"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => setFilters({ search: val, page: 1 })}
          debounceMs={500}
          loading={isFetching}
          width={{ base: '100%', md: '24rem' }}
        />

        <CustomSelect
          placeholder="All Status"
          options={INSPECTION_STATUS_OPTIONS}
          value={filters.status ? [filters.status] : undefined}
          onChange={(opt: { value: string[] }) =>
            setFilters({ status: opt?.value?.[0] ?? '', page: 1 })
          }
          rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
          controlProps={{ w: { base: '100%', md: '11rem' } }}
        />

        <Flex gap="2" align="center" wrap="wrap">
          <DateField
            label="From"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(val) => setFilters({ dateFrom: val, page: 1 })}
            containerProps={{ flex: { base: '1', md: 'unset' } }}
          />
          <DateField
            label="To"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(val) => setFilters({ dateTo: val, page: 1 })}
            containerProps={{ flex: { base: '1', md: 'unset' } }}
          />
        </Flex>
      </Flex>

      <CustomTable
        data={inspections}
        columns={columns}
        loading={isLoading}
        NoDataText={
          scoped
            ? 'No inspections for this organization'
            : 'No inspections found'
        }
        onRowClick={(row) =>
          navigate(
            RouteConstants.inspection.detail.generate({ id: row.original.id })
          )
        }
        pagination={{
          pageIndex: filters.page - 1,
          pageSize: filters.limit,
        }}
        setPagination={({ pageIndex }) => setFilters({ page: pageIndex + 1 })}
        pageCount={meta?.totalPages ?? 1}
        totalItems={meta?.total}
        hasNextPage={filters.page < (meta?.totalPages ?? 1)}
        hasPrevPage={filters.page > 1}
      />
    </Flex>
  );
}
