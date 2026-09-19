import { useMemo, useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import type { SortingState, Updater } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import {
  CustomSelect,
  CustomSwitch,
  DateField,
  SearchInput,
} from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import type { WhatsappActivitySortField } from '@/shared/interface/whatsapp';
import { useGetWhatsappActivity } from '../api';
import {
  WHATSAPP_ACTION_FILTER_OPTIONS,
  WHATSAPP_FLOW_FILTER_OPTIONS,
  WHATSAPP_OUTCOME_FILTER_OPTIONS,
  dayEndIso,
  dayStartIso,
} from '../data';
import { buildActivityColumns } from './activity-columns';
import { OrganizationFilter } from './OrganizationFilter';

/**
 * URL keys (all prefixed `wa_`). The overview's drill-downs write these same
 * keys, so keep the names in sync with WhatsappTemplate.
 */
export const ACTIVITY_FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 25 },
  search: { defaultValue: '' },
  phone: { defaultValue: '' },
  org: { defaultValue: '' },
  orgName: { defaultValue: '' },
  outcome: { defaultValue: 'all' },
  action: { defaultValue: 'all' },
  flow: { defaultValue: 'all' },
  onlyActions: { defaultValue: false },
  from: { defaultValue: '' },
  to: { defaultValue: '' },
  sortBy: { defaultValue: 'at' },
  sortOrder: { defaultValue: 'desc' },
};

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200].map((n) => ({
  label: `${n} per page`,
  value: String(n),
}));

const orAll = (value: string) => (value === 'all' ? undefined : value);

const selectProps = (width: string) => ({
  rootProps: { size: 'sm' as const, w: { base: '100%', md: 'auto' } },
  controlProps: { w: { base: '100%', md: width } },
});

interface WhatsappActivityFeedProps {
  /** Lock the feed to one organization. Omit for the whole platform. */
  organizationId?: string;
  onOpenConversation: (phone: string) => void;
}

/** Every message the bot received, in words an admin can act on. */
export function WhatsappActivityFeed({
  organizationId,
  onOpenConversation,
}: WhatsappActivityFeedProps) {
  const [filters, setFilters] = useUrlState(ACTIVITY_FILTER_SCHEMA, {
    replace: true,
    prefix: 'wa_',
  });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [phoneInput, setPhoneInput] = useState(filters.phone);

  const isDefaultSort = filters.sortBy === 'at' && filters.sortOrder === 'desc';

  const { data, isLoading, isFetching } = useGetWhatsappActivity({
    page: filters.page,
    limit: filters.limit,
    organizationId: organizationId ?? (filters.org || undefined),
    outcome: orAll(filters.outcome),
    action: orAll(filters.action),
    flow: orAll(filters.flow),
    onlyActions: filters.onlyActions || undefined,
    from: filters.from ? dayStartIso(filters.from) : undefined,
    to: filters.to ? dayEndIso(filters.to) : undefined,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.phone ? { phone: filters.phone } : {}),
    // Newest-first is the API default; only ask for something else.
    ...(isDefaultSort
      ? {}
      : {
          sortBy: filters.sortBy as WhatsappActivitySortField,
          sortOrder: filters.sortOrder as 'asc' | 'desc',
        }),
  });
  const events = data?.data ?? [];
  const meta = data?.meta;

  const columns = useMemo(
    () => buildActivityColumns({ showOrganization: !organizationId }),
    [organizationId]
  );

  // The API sorts across every page; the table only shows the arrows.
  const sorting = useMemo<SortingState>(
    () => [{ id: filters.sortBy, desc: filters.sortOrder === 'desc' }],
    [filters.sortBy, filters.sortOrder]
  );
  const handleSortingChange = (updater: Updater<SortingState>) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater;
    const first = next[0];
    setFilters(
      first
        ? { sortBy: first.id, sortOrder: first.desc ? 'desc' : 'asc', page: 1 }
        : { sortBy: 'at', sortOrder: 'desc', page: 1 }
    );
  };

  const filtered =
    Boolean(filters.search) ||
    Boolean(filters.phone) ||
    Boolean(filters.org) ||
    filters.outcome !== 'all' ||
    filters.action !== 'all' ||
    filters.flow !== 'all' ||
    filters.onlyActions ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  const clearFilters = () => {
    setSearchInput('');
    setPhoneInput('');
    setFilters({
      search: '',
      phone: '',
      org: '',
      orgName: '',
      outcome: 'all',
      action: 'all',
      flow: 'all',
      onlyActions: false,
      from: '',
      to: '',
      page: 1,
    });
  };

  return (
    <Box>
      <Flex
        alignItems={{ base: 'stretch', md: 'center' }}
        mb=".75rem"
        gap="3"
        direction={{ base: 'column', md: 'row' }}
        wrap="wrap"
      >
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
          placeholder="All outcomes"
          options={WHATSAPP_OUTCOME_FILTER_OPTIONS}
          value={[filters.outcome]}
          onChange={(opt: { value?: string[] }) =>
            setFilters({ outcome: opt?.value?.[0] || 'all', page: 1 })
          }
          {...selectProps('150px')}
        />
        <CustomSelect
          placeholder="Any action"
          options={WHATSAPP_ACTION_FILTER_OPTIONS}
          value={[filters.action]}
          onChange={(opt: { value?: string[] }) =>
            setFilters({ action: opt?.value?.[0] || 'all', page: 1 })
          }
          {...selectProps('190px')}
        />
        <CustomSelect
          placeholder="Any flow"
          options={WHATSAPP_FLOW_FILTER_OPTIONS}
          value={[filters.flow]}
          onChange={(opt: { value?: string[] }) =>
            setFilters({ flow: opt?.value?.[0] || 'all', page: 1 })
          }
          {...selectProps('180px')}
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
      </Flex>

      <Flex
        alignItems={{ base: 'stretch', md: 'center' }}
        mb="1.25rem"
        gap="3"
        direction={{ base: 'column', md: 'row' }}
        wrap="wrap"
      >
        <SearchInput
          placeholder="Search what they typed or their WhatsApp name"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => setFilters({ search: val, page: 1 })}
          debounceMs={500}
          loading={isFetching}
          width={{ base: '100%', md: '21rem' }}
        />
        <SearchInput
          placeholder="Phone number"
          value={phoneInput}
          onChange={setPhoneInput}
          onSearch={(val) => setFilters({ phone: val, page: 1 })}
          debounceMs={500}
          width={{ base: '100%', md: '12rem' }}
        />
        <Box flexShrink={0}>
          <CustomSwitch
            checked={filters.onlyActions}
            onCheckedChange={({ checked }: { checked: boolean }) =>
              setFilters({ onlyActions: checked, page: 1 })
            }
          >
            Only creates and changes
          </CustomSwitch>
        </Box>
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
          {meta
            ? `${(meta.total ?? 0).toLocaleString()} message${meta.total === 1 ? '' : 's'}${filtered ? ' match these filters' : ''}`
            : ' '}
          {' · sort by clicking When, Reply time, or AI calls'}
        </Text>
        <CustomSelect
          options={PAGE_SIZE_OPTIONS}
          value={[String(filters.limit)]}
          onChange={(opt: { value?: string[] }) =>
            setFilters({ limit: Number(opt?.value?.[0]) || 25, page: 1 })
          }
          {...selectProps('140px')}
        />
      </Flex>

      <Box overflowX="auto" minW={0}>
        <CustomTable
          data={events}
          columns={columns}
          loading={isLoading}
          enableSorting
          sorting={sorting}
          setSorting={
            handleSortingChange as unknown as (s: SortingState) => void
          }
          tableOptions={{ manualSorting: true, enableSortingRemoval: false }}
          NoDataText={
            filtered
              ? 'No WhatsApp activity matches these filters'
              : 'No WhatsApp activity yet'
          }
          onRowClick={(row) => onOpenConversation(row.original.phone)}
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
