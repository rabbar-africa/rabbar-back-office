import { useMemo, useState } from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { CustomTable } from '@/components/table';
import { CustomSelect } from '@/components/input/CustomSelect';
import { SearchInput } from '@/components/input/SearchInput';
import Status from '@/components/ui/Status';
import { useUrlState } from '@/hooks/useUrlState';
import { RouteConstants } from '@/shared/constants/routes';
import { pascalToCapitalized } from '@/utils/string-formatter';
import {
  JOB_CARD_PRIORITIES,
  JOB_CARD_STATUSES,
  type IJobCardListItem,
} from '@/shared/interface/job-card';
import { useGetJobCardsQuery } from '../api';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  ...JOB_CARD_STATUSES.map((status) => ({
    label: pascalToCapitalized(status),
    value: status,
  })),
];

const PRIORITY_OPTIONS = [
  { label: 'Any priority', value: '' },
  ...JOB_CARD_PRIORITIES.map((priority) => ({
    label: pascalToCapitalized(priority),
    value: priority,
  })),
];

/** Urgent/high stand out; the rest stay quiet so the list stays scannable. */
const PRIORITY_COLOR: Record<string, string> = {
  URGENT: 'error.300',
  HIGH: 'warning.500',
  NORMAL: 'gray.400',
  LOW: 'gray.200',
};

const vehicleLabel = (row: IJobCardListItem) =>
  [row.vehicleYear, row.vehicleMake, row.vehicleModel]
    .filter(Boolean)
    .join(' ') || '—';

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
  status: { defaultValue: '' },
  priority: { defaultValue: '' },
};

interface JobCardsTableProps {
  /** Scopes the list to one organization and hides the Organization column. */
  organizationId?: string;
  /** Prefix for the URL filter params, so embedded tables don't collide. */
  urlPrefix?: string;
}

/**
 * Job cards list — the workshop's work orders, with the counts of what each
 * one pulled together (inspections, invoices, payments, expenses).
 */
export function JobCardsTable({
  organizationId,
  urlPrefix,
}: JobCardsTableProps) {
  const scoped = Boolean(organizationId);

  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: urlPrefix,
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isLoading, isFetching } = useGetJobCardsQuery({
    page: filters.page,
    limit: filters.limit,
    ...(organizationId ? { organizationId } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
  });

  const jobCards = data?.data ?? [];
  const meta = data?.meta;

  const columns = useMemo<ColumnDef<IJobCardListItem, any>[]>(() => {
    const cols: ColumnDef<IJobCardListItem, any>[] = [
      {
        accessorKey: 'jobNumber',
        header: 'Job #',
        cell: ({ getValue, row }) => (
          <Flex direction="column">
            <Text fontSize="13px" color="gray.500" fontWeight="700">
              {(getValue() as string) || '—'}
            </Text>
            <Text
              fontSize="11px"
              color={PRIORITY_COLOR[row.original.priority] ?? 'gray.300'}
              fontWeight="600"
            >
              {pascalToCapitalized(row.original.priority)}
            </Text>
          </Flex>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ getValue, row }) => (
          <Flex direction="column">
            <Text fontSize="13px" color="gray.500" fontWeight="500">
              {(getValue() as string) || '—'}
            </Text>
            {row.original.customerPhone && (
              <Text fontSize="11px" color="gray.300">
                {row.original.customerPhone}
              </Text>
            )}
          </Flex>
        ),
      },
      {
        id: 'vehicle',
        header: 'Vehicle',
        cell: ({ row }) => (
          <Flex direction="column">
            <Text fontSize="13px" color="gray.500">
              {vehicleLabel(row.original)}
            </Text>
            {row.original.vehicleRegistrationNumber && (
              <Text fontSize="11px" color="gray.300">
                {row.original.vehicleRegistrationNumber}
              </Text>
            )}
          </Flex>
        ),
      },
      {
        accessorKey: 'complaint',
        header: 'Complaint',
        cell: ({ getValue }) => (
          <Text fontSize="12px" color="gray.400" lineClamp={2} maxW="16rem">
            {(getValue() as string) || '—'}
          </Text>
        ),
      },
      {
        id: 'linked',
        header: 'Linked',
        cell: ({ row }) => {
          const counts = row.original._count;
          return (
            <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
              {counts?.inspections ?? 0} insp · {counts?.invoices ?? 0} inv ·{' '}
              {counts?.payments ?? 0} pay
            </Text>
          );
        },
      },
      {
        id: 'opened',
        header: 'Opened',
        cell: ({ row }) => (
          <Flex direction="column">
            <Text fontSize="12px" color="gray.300">
              {row.original.openedAt
                ? moment(row.original.openedAt).format('DD MMM YYYY')
                : '—'}
            </Text>
            {row.original.promisedDate && (
              <Text fontSize="11px" color="gray.200">
                Due {moment(row.original.promisedDate).format('DD MMM')}
              </Text>
            )}
          </Flex>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <Status
            name={pascalToCapitalized(getValue() as string)}
            px=".5rem"
            w="auto"
            minW="7rem"
            whiteSpace="nowrap"
          />
        ),
      },
    ];

    if (!scoped) {
      cols.splice(1, 0, {
        id: 'organization',
        header: 'Organization',
        cell: ({ row }) => {
          const org = row.original.organization;
          if (!org) {
            return (
              <Text fontSize="13px" color="gray.300">
                —
              </Text>
            );
          }
          return (
            <Link
              to={RouteConstants.organizations.detail.generate({ id: org.id })}
              onClick={(e) => e.stopPropagation()}
            >
              <Text
                fontSize="13px"
                color="gray.500"
                fontWeight="500"
                _hover={{ textDecoration: 'underline' }}
              >
                {org.name}
              </Text>
            </Link>
          );
        },
      });
    }

    return cols;
  }, [scoped]);

  return (
    <Flex direction="column" gap="1rem">
      <Flex
        gap="3"
        wrap="wrap"
        align={{ base: 'stretch', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <SearchInput
          placeholder="Search job #, customer, vehicle or complaint"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(val) => setFilters({ search: val, page: 1 })}
          debounceMs={500}
          loading={isFetching}
          width={{ base: '100%', md: '24rem' }}
        />

        <CustomSelect
          placeholder="All Status"
          options={STATUS_OPTIONS}
          value={filters.status ? [filters.status] : undefined}
          onChange={(opt: { value: string[] }) =>
            setFilters({ status: opt?.value?.[0] ?? '', page: 1 })
          }
          rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
          controlProps={{ w: { base: '100%', md: '11rem' } }}
        />

        <CustomSelect
          placeholder="Any priority"
          options={PRIORITY_OPTIONS}
          value={filters.priority ? [filters.priority] : undefined}
          onChange={(opt: { value: string[] }) =>
            setFilters({ priority: opt?.value?.[0] ?? '', page: 1 })
          }
          rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
          controlProps={{ w: { base: '100%', md: '10rem' } }}
        />
      </Flex>

      <CustomTable
        data={jobCards}
        columns={columns}
        loading={isLoading}
        NoDataText={
          scoped ? 'No job cards for this organization' : 'No job cards found'
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
    </Flex>
  );
}
