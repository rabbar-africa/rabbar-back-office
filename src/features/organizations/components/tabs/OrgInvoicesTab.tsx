import { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { CustomTable } from '@/components/table';
import { SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { useGetInvoices } from '@/features/invoices/api/query';
import {
  // STATUS_OPTIONS,
  useInvoiceListColumns,
} from '@/features/invoices/components/invoice-columns';

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  status: { defaultValue: '' },
};

export function OrgInvoicesTab() {
  const { id } = useParams<{ id: string }>();
  const columns = useInvoiceListColumns();

  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: 'invoice_',
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isPending } = useGetInvoices(
    {
      organizationId: id,
      page: filters.page,
      limit: filters.limit,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    { enabled: !!id }
  );

  const invoices = data?.data || [];
  const meta = data?.meta;

  return (
    <Flex direction="column" gap="1rem">
      <Flex
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="3"
        wrap="wrap"
      >
        <SearchInput
          placeholder="Search by invoice # or customer"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => setFilters({ search: val, page: 1 })}
          debounceMs={500}
          loading={isPending}
          width={{ base: '100%', md: '22rem' }}
        />

        {/*  */}
      </Flex>

      <CustomTable
        data={invoices}
        columns={columns}
        loading={isPending}
        NoDataText="No invoices for this organization"
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
