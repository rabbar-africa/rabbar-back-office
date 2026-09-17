import { useMemo, useState } from 'react';
import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CustomTable } from '@/components/table';
import { PageHeader } from '@/components/common/PageHeader';
import { CustomSelect, SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { RouteConstants } from '@/shared/constants/routes';
import { useGetPromoCodes } from '../api';
import { PROMO_STATUS_FILTER_OPTIONS } from '../data';
import { buildPromoCodeColumns } from '../components/promo-code-columns';
import { PromoCodeFormModal } from '../components/PromoCodeFormModal';
import { usePromoActiveToggle } from '../components/usePromoActiveToggle';
import { usePaidPlans } from '../components/usePaidPlans';

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  status: { defaultValue: 'all' },
};

const IS_ACTIVE_BY_STATUS: Record<string, boolean | undefined> = {
  active: true,
  inactive: false,
};

export function PromoCodesTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetPromoCodes({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    isActive: IS_ACTIVE_BY_STATUS[filters.status],
  });
  const promoCodes = data?.data ?? [];
  const meta = data?.meta;

  const { planNames } = usePaidPlans();
  const { toggle, dialog, togglingId } = usePromoActiveToggle();

  const columns = useMemo(
    () =>
      buildPromoCodeColumns({
        planNames,
        onToggleActive: toggle,
        togglingId,
      }),
    // `toggle` is recreated each render but only closes over stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [planNames, togglingId]
  );

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Promo Codes"
          subtitle="Free months and discounts for organizations — typed at checkout or applied automatically at signup"
          action={
            <Button
              bg="primary.500"
              color="white"
              _hover={{ bg: 'primary.600' }}
              onClick={() => setCreateOpen(true)}
            >
              New Promo Code
            </Button>
          }
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
              All Promo Codes
            </Text>
            <Text textStyle="small-regular" color="gray.300">
              Click a row to edit a code and see who used it
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
              placeholder="All codes"
              options={PROMO_STATUS_FILTER_OPTIONS}
              value={[filters.status]}
              onChange={(opt: { value?: string[] }) =>
                setFilters({ status: opt?.value?.[0] || 'all', page: 1 })
              }
              rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
              controlProps={{ w: { base: '100%', md: '140px' } }}
            />
            <SearchInput
              placeholder="Search by code or description"
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
              data={promoCodes}
              columns={columns}
              loading={isLoading}
              NoDataText={
                filters.search || filters.status !== 'all'
                  ? 'No promo codes match these filters'
                  : 'No promo codes yet'
              }
              onRowClick={(row) =>
                navigate(
                  RouteConstants.promoCodes.detail.generate({
                    id: row.original.id,
                  })
                )
              }
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

      <PromoCodeFormModal
        open={createOpen}
        onOpenChange={({ open }) => setCreateOpen(open)}
      />
      {dialog}
    </>
  );
}
