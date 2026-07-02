import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { RouteConstants } from '@/shared/constants/routes';
import type { IOrganization } from '@/shared/interface/common';
import { useGetOrganizations } from '../api/query';
import { useUrlState } from '@/hooks/useUrlState';
import { SearchInput } from '@/components/input';
import { useState } from 'react';
import moment from 'moment';

const columns: ColumnDef<IOrganization, any>[] = [
  { accessorKey: 'name', header: 'Organization' },
  { accessorKey: 'companyEmail', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }) => (
      <Box>{moment(getValue()).format('DD, MMM,YYYY')} </Box>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }) => (
      <Status name={getValue() ? 'active' : 'inactive'} />
    ),
  },
];

export function OrganizationsTemplate() {
  const navigate = useNavigate();
  const FILTER_SCHEMA = {
    page: { defaultValue: 1 },
    limit: { defaultValue: 20 },
    search: { defaultValue: '' },
    // status: { defaultValue: "" },
    // dueDateFrom: { defaultValue: "" },
    // dueDateTo: { defaultValue: "" },
  };
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isPending } = useGetOrganizations({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
  });
  const organizationsData = data?.data || [];
  const meta = data?.meta;
  // console.log('data is ', data);
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
      </Flex>
      <CustomTable
        data={organizationsData}
        columns={columns}
        loading={isPending}
        NoDataText="No organizations yet"
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
            `${RouteConstants.organizations.detail.generate({ id: row.original.id })}`
          )
        }
      />
    </Flex>
  );
}
