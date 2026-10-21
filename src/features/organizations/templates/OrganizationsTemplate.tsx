import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, SortingState, Updater } from '@tanstack/react-table';
import moment from 'moment';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { RouteConstants } from '@/shared/constants/routes';
import type { IOrganization, SignupSource } from '@/shared/interface/common';
import { ChatCircle } from '@/assets/custom/ChatCircle';
import { GlobeIcon } from '@/assets/custom/GlobeIcon';
import { useGetOrganizations } from '../api/query';
import type { OrganizationSortField } from '../api/types';
import { RefreshButton } from '@/components/common/RefreshButton';
import { customQueryKey } from '@/shared/constants/query-keys';

const SIGNUP_SOURCES: Record<
  SignupSource,
  { label: string; icon: typeof ChatCircle; bg: string; color: string }
> = {
  WHATSAPP: {
    label: 'Signed up on WhatsApp',
    icon: ChatCircle,
    bg: 'success.50',
    color: 'success.300',
  },
  WEB: {
    label: 'Signed up on the web',
    icon: GlobeIcon,
    bg: 'gray.50',
    color: 'gray.400',
  },
};

/** Small tag under the name; nothing for rows from before the field existed. */
function SignupSourceTag({ source }: { source?: SignupSource | null }) {
  const meta = source ? SIGNUP_SOURCES[source] : undefined;
  if (!meta) return null;
  return (
    <Badge
      bg={meta.bg}
      color={meta.color}
      rounded="full"
      px=".5rem"
      py="1px"
      gap=".25rem"
      fontSize="10px"
      fontWeight="500"
      textTransform="none"
      whiteSpace="nowrap"
    >
      <Icon as={meta.icon} boxSize=".625rem" />
      {meta.label}
    </Badge>
  );
}

const formatDate = (value?: string | null) =>
  value ? moment(value).format('DD MMM YYYY') : null;

/**
 * Sortable column ids match the API's sortBy values (name, createdAt,
 * lastActivity). The API sorts the whole list before paging, so the table
 * only shows the arrows.
 */
const columns: ColumnDef<IOrganization, any>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Organization',
    cell: ({ row }) => (
      <Flex direction="column" align="flex-start" gap=".25rem">
        <Text>{row.original.name}</Text>
        <SignupSourceTag source={row.original.signupSource} />
      </Flex>
    ),
  },
  { accessorKey: 'companyEmail', header: 'Email', enableSorting: false },
  { accessorKey: 'phone', header: 'Phone', enableSorting: false },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created',
    sortDescFirst: true,
    cell: ({ getValue }) => formatDate(getValue()) ?? '—',
  },
  {
    id: 'lastActivity',
    accessorKey: 'lastActivityDate',
    header: 'Last Activity',
    sortDescFirst: true,
    cell: ({ getValue }) =>
      formatDate(getValue()) ?? (
        <Text as="span" color="gray.300">
          No activity yet
        </Text>
      ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    enableSorting: false,
    cell: ({ getValue }) => (
      <Status name={getValue() ? 'active' : 'inactive'} />
    ),
  },
];

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  sortBy: { defaultValue: 'lastActivity' },
  sortOrder: { defaultValue: 'desc' },
};

const TABLE_OPTIONS = { manualSorting: true, enableSortingRemoval: false };

export function OrganizationsTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);

  // The API's default is lastActivity/desc; only send a sort when it differs.
  const isDefaultSort =
    filters.sortBy === 'lastActivity' && filters.sortOrder === 'desc';

  const { data, isPending } = useGetOrganizations({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(isDefaultSort
      ? {}
      : {
          sortBy: filters.sortBy as OrganizationSortField,
          sortOrder: filters.sortOrder as 'asc' | 'desc',
        }),
  });
  const organizationsData = data?.data || [];
  const meta = data?.meta;

  const sorting = useMemo<SortingState>(
    () => [{ id: filters.sortBy, desc: filters.sortOrder === 'desc' }],
    [filters.sortBy, filters.sortOrder]
  );
  // A new sort starts again from page 1.
  const handleSortingChange = (updater: Updater<SortingState>) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater;
    const first = next[0];
    setFilters(
      first
        ? { sortBy: first.id, sortOrder: first.desc ? 'desc' : 'asc', page: 1 }
        : { sortBy: 'lastActivity', sortOrder: 'desc', page: 1 }
    );
  };

  const handleSearchCommit = (val: string) =>
    setFilters({ search: val, page: 1 });

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Heading fontSize="1.5rem" fontWeight="600">
          Organizations
        </Heading>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() => navigate(RouteConstants.organizations.create.path)}
        >
          Add Organization
        </Button>
      </Flex>
      <Flex
        justifyContent="flex-start"
        alignItems={{ base: 'stretch', md: 'center' }}
        mb=".5rem"
        gap="3"
        direction={{ base: 'column', md: 'row' }}
        wrap="wrap"
      >
        <SearchInput
          placeholder="Search by name"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearchCommit}
          debounceMs={500}
          loading={isPending}
          width={{ base: '100%', md: '21rem' }}
        />
        <RefreshButton
          queryKeys={[[customQueryKey.organizations.getAll]]}
          label="Reload organizations"
          ml={{ md: 'auto' }}
        />
      </Flex>
      <Box overflowX="auto" minW={0}>
        <CustomTable
          data={organizationsData}
          columns={columns}
          loading={isPending}
          NoDataText={
            filters.search
              ? 'No organizations match this search'
              : 'No organizations yet'
          }
          enableSorting
          sorting={sorting}
          setSorting={
            handleSortingChange as unknown as (s: SortingState) => void
          }
          tableOptions={TABLE_OPTIONS}
          pagination={{
            pageIndex: filters.page - 1,
            pageSize: filters.limit,
          }}
          setPagination={({ pageIndex }) => setFilters({ page: pageIndex + 1 })}
          pageCount={meta?.totalPages ?? 1}
          totalItems={meta?.total}
          hasNextPage={filters.page < (meta?.totalPages ?? 1)}
          hasPrevPage={filters.page > 1}
          onRowClick={(row) =>
            navigate(
              RouteConstants.organizations.detail.generate({
                id: row.original.id,
              })
            )
          }
        />
      </Box>
    </Flex>
  );
}
