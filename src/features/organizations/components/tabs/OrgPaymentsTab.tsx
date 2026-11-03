import { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';
import { CustomTable } from '@/components/table';
import { SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { paymentListColumns } from '@/features/payments/components/payment-columns';
import { useGetOrganizationPayments } from '../../api/query';
import { RefreshButton } from '@/components/common/RefreshButton';
import { customQueryKey } from '@/shared/constants/query-keys';

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
};

export function OrgPaymentsTab() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: 'payment_',
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  // Reads through the back office's cross-tenant endpoint — the tenant
  // `/payments-received` route takes the org from the JWT and would return
  // every organization's payments to a platform admin.
  const { data, isPending } = useGetOrganizationPayments(id ?? '', {
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
  });

  const payments = data?.data || [];
  const meta = data?.meta;

  return (
    <Flex direction="column" gap="1rem">
      <Flex
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="3"
      >
        <SearchInput
          placeholder="Search by payment # or customer"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => setFilters({ search: val, page: 1 })}
          debounceMs={500}
          loading={isPending}
          width={{ base: '100%', md: '22rem' }}
        />
        <RefreshButton
          queryKeys={[[customQueryKey.organizations.getPayments, id]]}
          label="Reload payments"
        />
      </Flex>

      <CustomTable
        data={payments}
        columns={paymentListColumns}
        loading={isPending}
        NoDataText="No payments for this organization"
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
            RouteConstants.payments.detail.generate({ id: row.original.id })
          )
        }
      />
    </Flex>
  );
}
