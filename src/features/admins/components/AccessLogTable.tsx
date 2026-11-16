import { useMemo } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import type { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { CustomTable } from '@/components/table';
import { CustomSelect, DateField } from '@/components/input';
import { RefreshButton } from '@/components/common/RefreshButton';
import { TruncatedText } from '@/components/common/TruncatedText';
import { useUrlState } from '@/hooks/useUrlState';
import { customQueryKey } from '@/shared/constants/query-keys';
import { RouteConstants } from '@/shared/constants/routes';
import type { IAccessLogEntry } from '@/shared/interface/admin';
import { OrganizationFilter } from '@/features/organizations/components/OrganizationFilter';
import { useGetAccessLog, useGetAdmins } from '../api';
import { describeAccess, formatQuery } from '../data';

const PAGE_SIZE = 50;

const FILTER_SCHEMA = {
  admin: { defaultValue: '' },
  org: { defaultValue: '' },
  orgName: { defaultValue: '' },
  from: { defaultValue: '' },
  to: { defaultValue: '' },
};

interface AccessLogTableProps {
  /** Lock the log to one business (its "Who opened this business" tab). */
  organizationId?: string;
  /** URL key prefix, so the filters don't clash with the page's. */
  urlPrefix?: string;
}

/** What admins opened and changed, newest first. Owners only. */
export function AccessLogTable({
  organizationId,
  urlPrefix = '',
}: AccessLogTableProps) {
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: urlPrefix,
  });

  const { data: admins } = useGetAdmins();
  const adminOptions = useMemo(
    () => [
      { label: 'Every admin', value: 'all' },
      ...(admins ?? []).map((admin) => ({
        label:
          [admin.firstName, admin.lastName].filter(Boolean).join(' ') ||
          admin.email,
        value: admin.id,
      })),
    ],
    [admins]
  );

  const businessId = organizationId ?? (filters.org || undefined);
  const { data, isPending, isFetching, hasNextPage, fetchNextPage } =
    useGetAccessLog({
      limit: PAGE_SIZE,
      ...(filters.admin ? { adminUserId: filters.admin } : {}),
      ...(businessId ? { organizationId: businessId } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
    });
  const entries = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.entries),
    [data]
  );

  const columns = useMemo(
    () => buildColumns({ showBusiness: !organizationId }),
    [organizationId]
  );

  const filtered =
    Boolean(filters.admin) ||
    (!organizationId && Boolean(filters.org)) ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  return (
    <Box>
      <Flex
        alignItems={{ base: 'stretch', md: 'center' }}
        mb="1rem"
        gap="2.5"
        direction={{ base: 'column', md: 'row' }}
        wrap="wrap"
      >
        <CustomSelect
          placeholder="Every admin"
          options={adminOptions}
          value={[filters.admin || 'all']}
          onChange={(opt: { value?: string[] }) => {
            const value = opt?.value?.[0];
            setFilters({ admin: value && value !== 'all' ? value : '' });
          }}
          rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
          controlProps={{ w: { base: '100%', md: '190px' } }}
        />
        {!organizationId && (
          <OrganizationFilter
            organizationId={filters.org}
            organizationName={filters.orgName}
            placeholder="Every business"
            onChange={(org) =>
              setFilters({ org: org?.id ?? '', orgName: org?.name ?? '' })
            }
          />
        )}
        <DateField
          label="From"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(value) => setFilters({ from: value })}
        />
        <DateField
          label="To"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(value) => setFilters({ to: value })}
        />
        {filtered && (
          <Button
            size="sm"
            variant="ghost"
            color="gray.400"
            onClick={() =>
              setFilters({ admin: '', org: '', orgName: '', from: '', to: '' })
            }
          >
            Clear filters
          </Button>
        )}
        <RefreshButton
          queryKeys={[[customQueryKey.admins.accessLog]]}
          label="Reload access log"
          ml={{ md: 'auto' }}
        />
      </Flex>

      <Box overflowX="auto" minW={0}>
        <CustomTable
          data={entries}
          columns={columns}
          loading={isPending}
          NoDataText={
            filtered
              ? 'Nothing in the access log matches these filters'
              : 'Nothing recorded yet'
          }
        />
      </Box>

      <Flex justify="center" align="center" gap="3" mt="1rem" minH="2rem">
        {hasNextPage ? (
          <Button
            size="sm"
            variant="outline"
            loading={isFetching}
            onClick={() => fetchNextPage()}
          >
            Load older entries
          </Button>
        ) : (
          entries.length > 0 && (
            <Text textStyle="tiny-regular" color="gray.300">
              That's everything{filtered ? ' for these filters' : ''}. Entries
              are kept for two years.
            </Text>
          )
        )}
      </Flex>
    </Box>
  );
}

function buildColumns({
  showBusiness,
}: {
  showBusiness: boolean;
}): ColumnDef<IAccessLogEntry, any>[] {
  return [
    {
      accessorKey: 'occurredAt',
      header: 'When',
      cell: ({ getValue }) => {
        const at = moment(getValue() as string);
        return (
          <Box whiteSpace="nowrap">
            <Text fontSize="13px" color="gray.500">
              {at.format('DD MMM YYYY, HH:mm')}
            </Text>
            <Text fontSize="11px" color="gray.300">
              {at.fromNow()}
            </Text>
          </Box>
        );
      },
    },
    {
      accessorKey: 'adminEmail',
      header: 'Admin',
      cell: ({ getValue }) => (
        <Text fontSize="13px" color="gray.500" whiteSpace="nowrap">
          {getValue() as string}
        </Text>
      ),
    },
    {
      id: 'what',
      header: 'What',
      cell: ({ row }) => {
        const entry = row.original;
        const { label, tone } = describeAccess(entry);
        const query = formatQuery(entry.query);
        return (
          <Box w="22rem" whiteSpace="normal">
            <Flex align="center" gap=".5rem">
              <Text
                fontSize="10px"
                fontWeight="600"
                letterSpacing=".02em"
                px=".375rem"
                rounded="sm"
                flexShrink={0}
                bg={
                  tone === 'danger'
                    ? 'error.50'
                    : tone === 'change'
                      ? 'warning.50'
                      : 'gray.50'
                }
                color={
                  tone === 'danger'
                    ? 'error.300'
                    : tone === 'change'
                      ? 'secondary.500'
                      : 'gray.400'
                }
              >
                {entry.method.replace(/_/g, ' ')}
              </Text>
              <Text fontSize="13px" color="gray.500" fontWeight="500">
                {label}
              </Text>
            </Flex>
            <TruncatedText
              lines={1}
              fontSize="11px"
              color="gray.300"
              mt="2px"
              fontFamily="mono"
            >
              {query ? `${entry.path}?${query}` : entry.path}
            </TruncatedText>
          </Box>
        );
      },
    },
    ...(showBusiness
      ? [
          {
            id: 'business',
            header: 'Business',
            meta: { disableRowClick: true },
            cell: ({ row }: { row: { original: IAccessLogEntry } }) => {
              const id = row.original.organizationId;
              if (!id)
                return (
                  <Text fontSize="12px" color="gray.300">
                    —
                  </Text>
                );
              return (
                <Link
                  to={RouteConstants.organizations.detail.generate(
                    { id },
                    { tab: 'access-log' }
                  )}
                  title={id}
                >
                  <Text
                    fontSize="13px"
                    color="primary.300"
                    fontWeight="500"
                    whiteSpace="nowrap"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Open · {id.slice(0, 8)}
                  </Text>
                </Link>
              );
            },
          } satisfies ColumnDef<IAccessLogEntry, any>,
        ]
      : []),
    {
      accessorKey: 'statusCode',
      header: 'Result',
      cell: ({ getValue }) => {
        const code = getValue() as number | null;
        if (code === null)
          return (
            <Text fontSize="12px" color="gray.300">
              —
            </Text>
          );
        const ok = code < 400;
        return (
          <Text
            fontSize="12px"
            fontWeight="600"
            color={ok ? 'success.300' : 'error.300'}
            whiteSpace="nowrap"
          >
            {code}
          </Text>
        );
      },
    },
    {
      id: 'from',
      header: 'From',
      cell: ({ row }) => (
        <Box w="10rem">
          <Text fontSize="12px" color="gray.500">
            {row.original.ip ?? '—'}
          </Text>
          {row.original.userAgent && (
            <TruncatedText lines={1} fontSize="11px" color="gray.300">
              {row.original.userAgent}
            </TruncatedText>
          )}
        </Box>
      ),
    },
  ];
}
