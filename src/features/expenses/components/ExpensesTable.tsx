import { useMemo, useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { CustomTable } from '@/components/table';
import { RefreshButton } from '@/components/common/RefreshButton';
import { CustomSelect, DateField, SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { customQueryKey } from '@/shared/constants/query-keys';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_PAYMENT_MODE_LABELS,
} from '@/shared/interface/expense';
import { formatCurrency } from '@/utils/calculations';
import { OrganizationFilter } from '@/features/organizations/components/OrganizationFilter';
import { useGetExpenses } from '../api';
import { buildExpenseColumns } from './expense-columns';

const CATEGORY_OPTIONS = [
  { label: 'All categories', value: 'all' },
  ...Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

const MODE_OPTIONS = [
  { label: 'Any payment mode', value: 'all' },
  ...Object.entries(EXPENSE_PAYMENT_MODE_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  org: { defaultValue: '' },
  orgName: { defaultValue: '' },
  category: { defaultValue: 'all' },
  mode: { defaultValue: 'all' },
  from: { defaultValue: '' },
  to: { defaultValue: '' },
};

const orAll = (value: string) => (value === 'all' ? undefined : value);

interface ExpensesTableProps {
  /** Lock the list to one organization. Omit for the whole platform. */
  organizationId?: string;
  /** URL key prefix, so the list's filters don't clash with the page's. */
  urlPrefix?: string;
}

/** Expenses across organizations, or one organization's. */
export function ExpensesTable({
  organizationId,
  urlPrefix = '',
}: ExpensesTableProps) {
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: urlPrefix,
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isLoading, isFetching } = useGetExpenses({
    page: filters.page,
    limit: filters.limit,
    organizationId: organizationId ?? (filters.org || undefined),
    category: orAll(filters.category),
    paymentMode: orAll(filters.mode),
    dateFrom: filters.from || undefined,
    dateTo: filters.to || undefined,
    ...(filters.search ? { search: filters.search } : {}),
  });
  const expenses = data?.data ?? [];
  const meta = data?.meta;

  const columns = useMemo(
    () => buildExpenseColumns({ showOrganization: !organizationId }),
    [organizationId]
  );

  const filtered =
    Boolean(filters.search) ||
    (!organizationId && Boolean(filters.org)) ||
    filters.category !== 'all' ||
    filters.mode !== 'all' ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      org: '',
      orgName: '',
      category: 'all',
      mode: 'all',
      from: '',
      to: '',
      page: 1,
    });
  };

  return (
    <Box>
      <Flex
        alignItems={{ base: 'stretch', md: 'center' }}
        mb="1rem"
        gap="2.5"
        direction={{ base: 'column', md: 'row' }}
        wrap="wrap"
      >
        <SearchInput
          placeholder="Search expense #, name, or vendor"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => setFilters({ search: val, page: 1 })}
          debounceMs={500}
          loading={isFetching}
          width={{ base: '100%', md: '18rem' }}
        />
        {!organizationId && (
          <OrganizationFilter
            organizationId={filters.org}
            organizationName={filters.orgName}
            onChange={(org) =>
              setFilters({
                org: org?.id ?? '',
                orgName: org?.name ?? '',
                page: 1,
              })
            }
          />
        )}
        <CustomSelect
          placeholder="All categories"
          options={CATEGORY_OPTIONS}
          value={[filters.category]}
          onChange={(opt: { value?: string[] }) =>
            setFilters({ category: opt?.value?.[0] || 'all', page: 1 })
          }
          rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
          controlProps={{ w: { base: '100%', md: '150px' } }}
        />
        <CustomSelect
          placeholder="Any payment mode"
          options={MODE_OPTIONS}
          value={[filters.mode]}
          onChange={(opt: { value?: string[] }) =>
            setFilters({ mode: opt?.value?.[0] || 'all', page: 1 })
          }
          rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
          controlProps={{ w: { base: '100%', md: '165px' } }}
        />
        <DateField
          label="From"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(value) => setFilters({ from: value, page: 1 })}
        />
        <DateField
          label="To"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(value) => setFilters({ to: value, page: 1 })}
        />
        {filtered && (
          <Button
            size="sm"
            variant="ghost"
            color="gray.400"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        gap="3"
        mb=".75rem"
        wrap="wrap"
      >
        <Text textStyle="small-regular" color="gray.300">
          {meta ? (
            <>
              {(meta.total ?? 0).toLocaleString()} expense
              {meta.total === 1 ? '' : 's'}
              {filtered ? ' match these filters' : ''} ·{' '}
              <Text as="span" fontWeight="600" color="gray.500">
                {formatCurrency(meta.totalAmount ?? 0)}
              </Text>{' '}
              in total
            </>
          ) : (
            ' '
          )}
        </Text>
        <RefreshButton
          queryKeys={[[customQueryKey.expenses.getAll]]}
          label="Reload expenses"
          alignSelf="center"
        />
      </Flex>

      <Box overflowX="auto" minW={0}>
        <CustomTable
          data={expenses}
          columns={columns}
          loading={isLoading}
          NoDataText={
            filtered ? 'No expenses match these filters' : 'No expenses yet'
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
      </Box>
    </Box>
  );
}
