import { useMemo, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import {
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import { SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import type { IWhatsappPerson } from '@/shared/interface/whatsapp';
import { useGetWhatsappPeople } from '../api';
import {
  DEFAULT_WHATSAPP_PERIOD,
  formatRelative,
  formatWhen,
  personKey,
  resolvePeriod,
  whoName,
  whoSubtitle,
} from '../data';
import { OrganizationFilter } from './OrganizationFilter';
import { PeriodFilter } from './PeriodFilter';

const FILTER_SCHEMA = {
  peoplePeriod: { defaultValue: DEFAULT_WHATSAPP_PERIOD },
  peopleFrom: { defaultValue: '' },
  peopleTo: { defaultValue: '' },
  peopleOrg: { defaultValue: '' },
  peopleOrgName: { defaultValue: '' },
};

// The endpoint returns everyone in the period at once, so sorting and the
// name search run in the browser over the full list.
const SORTED_ROW_MODEL = getSortedRowModel<IWhatsappPerson>();
const TABLE_OPTIONS = {
  getSortedRowModel: SORTED_ROW_MODEL,
  enableSortingRemoval: false,
};
const DEFAULT_SORT: SortingState = [{ id: 'lastSeen', desc: true }];

const matches = (person: IWhatsappPerson, query: string) =>
  [
    person.phone,
    person.who?.name,
    person.who?.email,
    person.who?.whatsappName,
    person.organization?.name,
  ].some((value) => value?.toLowerCase().includes(query));

const buildColumns = (
  showOrganization: boolean
): ColumnDef<IWhatsappPerson, any>[] => [
  {
    id: 'who',
    header: 'Person',
    accessorFn: (row) => whoName(row.who, row.phone).toLowerCase(),
    cell: ({ row }) => (
      <Box>
        <Text textStyle="small-semibold" color="gray.500" whiteSpace="nowrap">
          {whoName(row.original.who, row.original.phone)}
        </Text>
        <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
          {whoSubtitle(row.original.who, row.original.phone)}
        </Text>
      </Box>
    ),
  },
  ...(showOrganization
    ? ([
        {
          id: 'organization',
          header: 'Organization',
          accessorFn: (row: IWhatsappPerson) =>
            row.organization?.name?.toLowerCase() ?? '',
          cell: ({ row }) => (
            <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
              {row.original.organization?.name ?? '—'}
            </Text>
          ),
        },
      ] as ColumnDef<IWhatsappPerson, any>[])
    : []),
  { accessorKey: 'messages', header: 'Messages', sortDescFirst: true },
  {
    accessorKey: 'thingsDone',
    header: 'Things done',
    sortDescFirst: true,
    cell: ({ getValue }) => (
      <Text
        fontSize="13px"
        fontWeight="600"
        color={(getValue() as number) > 0 ? 'success.300' : 'gray.300'}
      >
        {getValue() as number}
      </Text>
    ),
  },
  {
    accessorKey: 'failures',
    header: 'Failures',
    sortDescFirst: true,
    cell: ({ getValue }) => (
      <Text
        fontSize="13px"
        fontWeight="600"
        color={(getValue() as number) > 0 ? 'error.300' : 'gray.300'}
      >
        {getValue() as number}
      </Text>
    ),
  },
  {
    accessorKey: 'lastSeen',
    header: 'Last seen',
    // ISO timestamps order correctly as plain strings.
    sortingFn: 'basic',
    sortDescFirst: true,
    cell: ({ getValue }) => (
      <Box>
        <Text fontSize="12px" color="gray.500" whiteSpace="nowrap">
          {formatRelative(getValue() as string)}
        </Text>
        <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
          {formatWhen(getValue() as string)}
        </Text>
      </Box>
    ),
  },
  {
    accessorKey: 'lastActivity',
    header: 'Last thing they did',
    enableSorting: false,
    cell: ({ getValue }) => (
      <Text
        fontSize="12px"
        color="gray.400"
        maxW="22rem"
        whiteSpace="normal"
        lineClamp={2}
      >
        {(getValue() as string) || '—'}
      </Text>
    ),
  },
];

interface WhatsappPeopleListProps {
  organizationId?: string;
  onOpenConversation: (phone: string) => void;
}

/** Who used the bot in the period, and what each of them got done. */
export function WhatsappPeopleList({
  organizationId,
  onOpenConversation,
}: WhatsappPeopleListProps) {
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: 'wa_',
  });

  const [search, setSearch] = useState('');
  const [usersSorting, setUsersSorting] = useState(DEFAULT_SORT);
  const [unlinkedSorting, setUnlinkedSorting] = useState(DEFAULT_SORT);

  const period = useMemo(
    () =>
      resolvePeriod({
        period: filters.peoplePeriod,
        from: filters.peopleFrom,
        to: filters.peopleTo,
      }),
    [filters.peoplePeriod, filters.peopleFrom, filters.peopleTo]
  );

  const { data, isLoading } = useGetWhatsappPeople({
    organizationId: organizationId ?? (filters.peopleOrg || undefined),
    ...period,
  });
  const people = data?.data;

  const query = search.trim().toLowerCase();
  const users = useMemo(
    () => (people?.users ?? []).filter((p) => !query || matches(p, query)),
    [people, query]
  );
  const unlinked = useMemo(
    () =>
      (people?.unlinkedNumbers ?? []).filter(
        (p) => !query || matches(p, query)
      ),
    [people, query]
  );

  const columns = useMemo(
    () => buildColumns(!organizationId),
    [organizationId]
  );

  // An unlinked number has no organization, so it only appears platform-wide.
  const scopedToOrg = Boolean(organizationId || filters.peopleOrg);
  const showUnlinked = !scopedToOrg || unlinked.length > 0;

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex
        alignItems={{ base: 'stretch', md: 'center' }}
        gap="3"
        direction={{ base: 'column', md: 'row' }}
        wrap="wrap"
      >
        <PeriodFilter
          value={{
            period: filters.peoplePeriod,
            from: filters.peopleFrom,
            to: filters.peopleTo,
          }}
          onChange={(next) =>
            setFilters({
              ...(next.period !== undefined && { peoplePeriod: next.period }),
              ...(next.from !== undefined && { peopleFrom: next.from }),
              ...(next.to !== undefined && { peopleTo: next.to }),
            })
          }
        />
        {!organizationId && (
          <OrganizationFilter
            organizationId={filters.peopleOrg}
            organizationName={filters.peopleOrgName}
            onChange={(org) =>
              setFilters({
                peopleOrg: org?.id ?? '',
                peopleOrgName: org?.name ?? '',
              })
            }
          />
        )}
        <SearchInput
          placeholder="Search name, number, email, or organization"
          value={search}
          onChange={setSearch}
          onSearch={setSearch}
          debounceMs={200}
          width={{ base: '100%', md: '21rem' }}
        />
      </Flex>
      {people?.period && (
        <Text textStyle="small-regular" color="gray.300" mt="-.75rem">
          {formatWhen(people.period.from)} – {formatWhen(people.period.to)} ·
          click a column header to sort
        </Text>
      )}

      <Box>
        <SectionTitle
          title="Linked users"
          subtitle={`${users.length} ${users.length === 1 ? 'person' : 'people'} used the bot in this period`}
        />
        <Box overflowX="auto" minW={0}>
          <CustomTable
            data={users}
            columns={columns}
            loading={isLoading}
            getRowId={personKey}
            enableSorting
            sorting={usersSorting}
            setSorting={setUsersSorting}
            tableOptions={TABLE_OPTIONS}
            NoDataText="Nobody used the WhatsApp bot in this period"
            onRowClick={(row) => onOpenConversation(row.original.phone)}
          />
        </Box>
      </Box>

      {showUnlinked && (
        <Box>
          <SectionTitle
            title="Unlinked numbers"
            subtitle="Messaged the bot without an account — worth following up"
          />
          <Box overflowX="auto" minW={0}>
            <CustomTable
              data={unlinked}
              columns={columns}
              loading={isLoading}
              getRowId={personKey}
              enableSorting
              sorting={unlinkedSorting}
              setSorting={setUnlinkedSorting}
              tableOptions={TABLE_OPTIONS}
              NoDataText="No unlinked numbers in this period"
              onRowClick={(row) => onOpenConversation(row.original.phone)}
            />
          </Box>
        </Box>
      )}
    </Flex>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Box mb=".75rem">
      <Text textStyle="default-bold" color="gray.500">
        {title}
      </Text>
      <Text textStyle="tiny-regular" color="gray.300">
        {subtitle}
      </Text>
    </Box>
  );
}
