import { useMemo, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CustomTable } from '@/components/table';
import { CustomSelect, SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { RouteConstants } from '@/shared/constants/routes';
import { useGetPlans } from '@/features/organizations/api/query';
import { useGetSubscriptions } from '../api';
import { SUBSCRIPTION_STATUS_FILTER_OPTIONS, planNamesById } from '../data';
import { buildSubscriptionColumns } from './subscription-columns';

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  status: { defaultValue: 'all' },
  tier: { defaultValue: 'all' },
};

const orAll = (value: string) => (value === 'all' ? undefined : value);

/** Every organization's subscription. Click a row to manage it on the org. */
export function SubscriptionsTab() {
  const navigate = useNavigate();
  // Prefixed so the payments tab's filters on the same page don't collide.
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: 'sub_',
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isLoading, isFetching } = useGetSubscriptions({
    page: filters.page,
    limit: filters.limit,
    status: orAll(filters.status),
    tier: orAll(filters.tier),
    ...(filters.search ? { search: filters.search } : {}),
  });
  const subscriptions = data?.data ?? [];
  const meta = data?.meta;

  const { data: plansData } = useGetPlans();
  const plans = plansData?.data;
  const planOptions = useMemo(
    () => [
      { label: 'All plans', value: 'all' },
      ...(plans ?? []).map((plan) => ({ label: plan.name, value: plan.tier })),
    ],
    [plans]
  );
  const columns = useMemo(
    () => buildSubscriptionColumns(planNamesById(plans)),
    [plans]
  );

  const filtered =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    filters.tier !== 'all';

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
          All Subscriptions
        </Text>
        <Text textStyle="small-regular" color="gray.300">
          Click a row to record a payment, change the plan, or cancel on the
          organization
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
          placeholder="All statuses"
          options={SUBSCRIPTION_STATUS_FILTER_OPTIONS}
          value={[filters.status]}
          onChange={(opt: { value?: string[] }) =>
            setFilters({ status: opt?.value?.[0] || 'all', page: 1 })
          }
          rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
          controlProps={{ w: { base: '100%', md: '150px' } }}
        />
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
        <SearchInput
          placeholder="Search by organization name or email"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => setFilters({ search: val, page: 1 })}
          debounceMs={500}
          loading={isFetching}
          width={{ base: '100%', md: '21rem' }}
        />
      </Flex>

      <Box overflowX="auto" minW={0}>
        <CustomTable
          data={subscriptions}
          columns={columns}
          loading={isLoading}
          NoDataText={
            filtered
              ? 'No subscriptions match these filters'
              : 'No subscriptions yet'
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
