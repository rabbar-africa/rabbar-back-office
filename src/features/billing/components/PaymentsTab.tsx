import { useMemo, useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CustomTable } from '@/components/table';
import { CustomSelect, DateField, SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { RouteConstants } from '@/shared/constants/routes';
import { useGetPlans } from '@/features/organizations/api/query';
import { useGetSubscriptionPayments } from '../api';
import { dayEndIso, dayStartIso } from '../data';
import { paymentColumns } from './payment-columns';

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  tier: { defaultValue: 'all' },
  from: { defaultValue: '' },
  to: { defaultValue: '' },
};

/** The global subscription payment ledger: manual, Paystack, and promo payments. */
export function PaymentsTab() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: 'pay_',
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isLoading, isFetching } = useGetSubscriptionPayments({
    page: filters.page,
    limit: filters.limit,
    tier: filters.tier === 'all' ? undefined : filters.tier,
    from: filters.from ? dayStartIso(filters.from) : undefined,
    to: filters.to ? dayEndIso(filters.to) : undefined,
    ...(filters.search ? { search: filters.search } : {}),
  });
  const payments = data?.data ?? [];
  const meta = data?.meta;

  const { data: plansData } = useGetPlans();
  const planOptions = useMemo(
    () => [
      { label: 'All plans', value: 'all' },
      ...(plansData?.data ?? []).map((plan) => ({
        label: plan.name,
        value: plan.tier,
      })),
    ],
    [plansData]
  );

  const filtered =
    Boolean(filters.search) ||
    filters.tier !== 'all' ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ search: '', tier: 'all', from: '', to: '', page: 1 });
  };

  return (
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
          Payment Ledger
        </Text>
        <Text textStyle="small-regular" color="gray.300">
          Every subscription payment across all organizations — manual,
          Paystack, and promo
        </Text>
      </Box>

      <Flex
        justifyContent="flex-start"
        alignItems={{ base: 'stretch', md: 'center' }}
        mb="1.5rem"
        gap="3"
        direction={{ base: 'column', md: 'row' }}
        wrap="wrap"
      >
        <CustomSelect
          placeholder="All plans"
          options={planOptions}
          value={[filters.tier]}
          onChange={(opt: { value?: string[] }) =>
            setFilters({ tier: opt?.value?.[0] || 'all', page: 1 })
          }
          rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
          controlProps={{ w: { base: '100%', md: '150px' } }}
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
        <SearchInput
          placeholder="Search by reference, note, or organization"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => setFilters({ search: val, page: 1 })}
          debounceMs={500}
          loading={isFetching}
          width={{ base: '100%', md: '21rem' }}
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

      <Box overflowX="auto" minW={0}>
        <CustomTable
          data={payments}
          columns={paymentColumns}
          loading={isLoading}
          NoDataText={
            filtered
              ? 'No payments match these filters'
              : 'No subscription payments yet'
          }
          onRowClick={(row) =>
            navigate(
              RouteConstants.organizations.detail.generate(
                { id: row.original.organizationId },
                { tab: 'subscription' }
              )
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
      </Box>
    </Box>
  );
}
