import { useMemo, useState } from 'react';
import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, type TableAction } from '@/components/table';
import { PageHeader } from '@/components/common/PageHeader';
import { RefreshButton } from '@/components/common/RefreshButton';
import { CustomSelect, SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { RouteConstants } from '@/shared/constants/routes';
import type { IPaymentReceived } from '@/shared/interface/payment';
import { organizationColumn } from '@/features/organizations/components/organization-column';
import { useGetBackOfficePaymentsQuery } from '../api/query';
import { paymentListColumns } from '../components/payment-columns';

/** Mirrors PaymentReceivedStatus on the API. */
const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Partially refunded', value: 'PARTIALLY_REFUNDED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  status: { defaultValue: 'all' },
};

const columns = [
  paymentListColumns[0],
  organizationColumn<IPaymentReceived>('payments'),
  ...paymentListColumns.slice(1),
];

/** Every organization's payments received, newest first. */
export function PaymentsTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isLoading, isFetching } = useGetBackOfficePaymentsQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status !== 'all' ? { status: filters.status } : {}),
  });
  const payments = data?.data ?? [];
  const meta = data?.meta;

  const openOrganizationPayments = (payment: IPaymentReceived) =>
    navigate(
      RouteConstants.organizations.detail.generate(
        { id: payment.organization?.id ?? '' },
        { tab: 'payments' }
      )
    );

  const openReceipt = (payment: IPaymentReceived) =>
    navigate(RouteConstants.payments.detail.generate({ id: payment.id }));

  const actions = useMemo<TableAction<IPaymentReceived>[]>(
    () => [
      {
        label: 'View receipt',
        value: 'receipt',
        onClick: openReceipt,
      },
      {
        label: 'Open organization',
        value: 'organization',
        onClick: openOrganizationPayments,
        disabled: (payment) => !payment.organization?.id,
      },
      {
        label: 'Open invoice',
        value: 'invoice',
        // A payment can settle several invoices; open the first.
        onClick: (payment) => {
          const invoiceId = payment.allocations?.[0]?.invoiceId;
          if (invoiceId)
            navigate(
              RouteConstants.invoices.detail.generate({ id: invoiceId })
            );
        },
        disabled: (payment) => !payment.allocations?.[0]?.invoiceId,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate]
  );

  const filtered = Boolean(filters.search) || filters.status !== 'all';

  return (
    <Stack gap="6">
      <PageHeader
        title="Payments Received"
        subtitle="Every organization's payments from their customers"
      />

      <Box
        pt={{ base: '1.25rem', md: '2rem' }}
        pb={{ base: '1.25rem', md: '2rem' }}
        bg="white"
        px={{ base: '0.75rem', md: '1rem' }}
        rounded=".625rem"
        shadow="sm"
        borderWidth="1px"
        borderColor="gray.75"
      >
        <Box mb="1rem">
          <Text
            textStyle={{ base: 'default-bold', md: 'large-bold' }}
            color="gray.500"
          >
            All Payments
          </Text>
          <Text textStyle="small-regular" color="gray.300">
            Click a row to view the receipt
          </Text>
        </Box>

        <Flex
          alignItems={{ base: 'stretch', md: 'center' }}
          mb="1.5rem"
          gap="3"
          direction={{ base: 'column', md: 'row' }}
          wrap="wrap"
        >
          <SearchInput
            placeholder="Search payment #, reference, or customer"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={(val) => setFilters({ search: val, page: 1 })}
            debounceMs={500}
            loading={isFetching}
            width={{ base: '100%', md: '21rem' }}
          />
          <CustomSelect
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={[filters.status]}
            onChange={(opt: { value?: string[] }) =>
              setFilters({ status: opt?.value?.[0] || 'all', page: 1 })
            }
            rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
            controlProps={{ w: { base: '100%', md: '170px' } }}
          />
          <RefreshButton
            queryKeys={[['payments']]}
            label="Reload payments"
            ml={{ md: 'auto' }}
          />
        </Flex>

        <Box overflowX="auto" minW={0}>
          <CustomTable
            data={payments}
            columns={columns}
            loading={isLoading}
            NoDataText={
              filtered
                ? 'No payments match these filters'
                : 'No payments received yet'
            }
            enableActions
            actions={actions}
            onRowClick={(row) => openReceipt(row.original)}
            pagination={{
              pageIndex: filters.page - 1,
              pageSize: filters.limit,
            }}
            setPagination={({ pageIndex }) =>
              setFilters({ page: pageIndex + 1 })
            }
            pageCount={meta?.totalPages ?? 1}
            totalItems={meta?.total}
            hasNextPage={filters.page < (meta?.totalPages ?? 1)}
            hasPrevPage={filters.page > 1}
          />
        </Box>
      </Box>
    </Stack>
  );
}
