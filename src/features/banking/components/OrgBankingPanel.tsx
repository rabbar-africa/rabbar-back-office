import { useMemo, useState } from 'react';
import { Badge, Box, Button, Flex, Grid, Stack, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';
import { CustomTable, type TableAction } from '@/components/table';
import { RefreshButton } from '@/components/common/RefreshButton';
import { RouteConstants } from '@/shared/constants/routes';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { BusinessAccountRow } from '@/shared/interface/banking';
import { formatCurrency } from '@/utils/calculations';
import { useDownloadStatementPdf, useGetBusinessStatement } from '../api';
import {
  StatementRangePicker,
  useStatementRange,
} from './StatementRangePicker';
import { StatementSummary } from './StatementSummary';
import { EmailStatementModal } from './EmailStatementModal';

const formatDay = (day: string) => moment(day).format('DD MMM YYYY');

interface OrgBankingPanelProps {
  orgId: string;
  businessEmail?: string | null;
}

/**
 * One organization's money for a period: the business statement to download
 * or email, and every account (Cash included) with its own statement.
 */
export function OrgBankingPanel({
  orgId,
  businessEmail,
}: OrgBankingPanelProps) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { preset, range, setRange } = useStatementRange();

  const { data, isLoading, isFetching } = useGetBusinessStatement(orgId, range);
  const statement = data?.data;
  const currencyCode = statement?.currencyCode ?? 'NGN';
  const money = (amount: number) => formatCurrency(amount, currencyCode);

  const download = useDownloadStatementPdf();
  const downloadingAccount = download.isPending
    ? (download.variables?.accountId ?? 'business')
    : null;

  // null = closed; {} = the business statement; { accountId } = that account's.
  const [emailing, setEmailing] = useState<{
    accountId?: string;
    label?: string;
  } | null>(null);

  // The statement page reads the same period keys from the URL.
  const openStatement = (accountId: string) =>
    navigate(
      `${RouteConstants.organizations.statement.generate({
        id: orgId,
        accountId,
      })}${search}`
    );

  const columns = useMemo<ColumnDef<BusinessAccountRow>[]>(
    () => [
      {
        accessorKey: 'label',
        header: 'Account',
        cell: ({ row }) => (
          <Flex align="center" gap="2" flexWrap="wrap">
            <Text textStyle="small-semibold" color="gray.500">
              {row.original.label}
            </Text>
            {row.original.isPrimary && (
              <Badge size="sm" variant="subtle" colorPalette="blue">
                Primary
              </Badge>
            )}
            {row.original.type === 'CASH' && (
              <Badge size="sm" variant="subtle">
                Cash
              </Badge>
            )}
          </Flex>
        ),
      },
      ...(
        [
          ['openingBalance', 'Opening'],
          ['moneyIn', 'Money in'],
          ['moneyOut', 'Money out'],
          ['closingBalance', 'Closing'],
        ] as const
      ).map(
        ([key, header]): ColumnDef<BusinessAccountRow> => ({
          accessorKey: key,
          header,
          cell: ({ getValue }) => {
            const value = getValue() as number;
            const color =
              key === 'moneyIn'
                ? 'success.300'
                : key === 'moneyOut'
                  ? 'error.300'
                  : value < 0
                    ? 'error.300'
                    : 'gray.500';
            return (
              <Text
                textStyle={
                  key === 'openingBalance' ? 'small-regular' : 'small-semibold'
                }
                color={color}
                whiteSpace="nowrap"
              >
                {money(value)}
              </Text>
            );
          },
        })
      ),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currencyCode]
  );

  const actions: TableAction<BusinessAccountRow>[] = [
    {
      label: 'View statement',
      value: 'view',
      onClick: (row) => openStatement(row.id),
    },
    {
      label: 'Download PDF',
      value: 'download',
      onClick: (row) => download.mutate({ orgId, accountId: row.id, range }),
    },
    {
      label: 'Email to the business',
      value: 'email',
      onClick: (row) => setEmailing({ accountId: row.id, label: row.label }),
    },
  ];

  const unassigned = statement?.accounts.unassigned;
  const profit = statement?.profit.onCollected ?? 0;

  return (
    <>
      <Stack gap="5">
        <Flex
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="3"
        >
          <StatementRangePicker
            preset={preset}
            range={range}
            onChange={setRange}
          />
          <RefreshButton
            queryKeys={[
              [customQueryKey.banking.business, orgId],
              [customQueryKey.banking.statement, orgId],
            ]}
            label="Reload statements"
          />
        </Flex>

        {/* Business statement */}
        <Box
          bg="white"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
          p={{ base: '1rem', md: '1.5rem' }}
          opacity={isFetching && !isLoading ? 0.6 : 1}
          transition="opacity 0.15s"
        >
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap="3"
            mb="5"
          >
            <Box>
              <Text textStyle="large-bold" color="gray.500">
                Business statement
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                {statement
                  ? `${formatDay(statement.period.from)} – ${formatDay(
                      statement.period.to
                    )} · money by account, sales, spending, profit and tax`
                  : 'Money by account, sales, spending, profit and tax'}
              </Text>
            </Box>
            <Flex gap="2">
              <Button
                variant="outline"
                size="sm"
                disabled={!statement}
                onClick={() => setEmailing({})}
              >
                Email to the business
              </Button>
              <Button
                size="sm"
                bg="primary.300"
                color="white"
                _hover={{ bg: 'primary.400' }}
                loading={downloadingAccount === 'business'}
                disabled={!statement}
                onClick={() => download.mutate({ orgId, range })}
              >
                Download PDF
              </Button>
            </Flex>
          </Flex>

          {statement ? (
            <>
              <StatementSummary
                currencyCode={currencyCode}
                tiles={[
                  {
                    label: 'Collected',
                    amount: statement.sales.collected,
                    color: 'success.300',
                    hint: `${statement.sales.paymentCount} payment${statement.sales.paymentCount === 1 ? '' : 's'}`,
                  },
                  {
                    label: 'Spent',
                    amount: statement.spending.total,
                    color: 'error.300',
                    hint: 'Expenses and bank charges',
                  },
                  {
                    label: 'Customers owe',
                    amount: statement.sales.owedAtEnd,
                    hint: `On ${formatDay(statement.period.to)}`,
                  },
                  {
                    label:
                      profit < 0 ? 'Loss (collected)' : 'Profit (collected)',
                    amount: profit,
                    color: profit < 0 ? 'error.300' : 'success.300',
                    hint: 'Collected before tax, less spending',
                  },
                ]}
              />
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                gap="3"
                mt="3"
              >
                <Fact
                  label="Invoiced"
                  value={`${money(statement.sales.invoiced)} · ${statement.sales.invoiceCount} invoice${statement.sales.invoiceCount === 1 ? '' : 's'}`}
                />
                <Fact
                  label="Tax charged"
                  value={money(statement.tax.totalCharged)}
                />
                <Fact
                  label="Profit on what was billed"
                  value={money(statement.profit.onBilled)}
                  danger={statement.profit.onBilled < 0}
                />
              </Grid>
            </>
          ) : (
            !isLoading && (
              <Text textStyle="small-regular" color="gray.300">
                No statement for this period.
              </Text>
            )
          )}
        </Box>

        {/* Accounts */}
        <Box
          pt={{ base: '1rem', md: '1.5rem' }}
          pb={{ base: '1rem', md: '1.5rem' }}
          bg="white"
          px={{ base: '0.75rem', md: '1rem' }}
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
          opacity={isFetching && !isLoading ? 0.6 : 1}
          transition="opacity 0.15s"
        >
          <Box mb="4">
            <Text textStyle="large-bold" color="gray.500">
              Account statements
            </Text>
            <Text textStyle="small-regular" color="gray.300">
              Click an account for every payment, expense and transfer, with a
              running balance
            </Text>
          </Box>
          <Box overflowX="auto" minW={0}>
            <CustomTable
              data={statement?.accounts.rows ?? []}
              columns={columns}
              loading={isLoading}
              actions={actions}
              enableActions
              NoDataText="This organization has no accounts yet"
              onRowClick={(row) => openStatement(row.original.id)}
            />
          </Box>
          {statement && (
            <Text textStyle="tiny-regular" color="gray.300" mt="3">
              Across all accounts: {money(statement.accounts.total.moneyIn)} in,{' '}
              {money(statement.accounts.total.moneyOut)} out. Money moved
              between the organization&apos;s own accounts shows on each account
              but not in this total.
            </Text>
          )}
          {unassigned && (
            <Text textStyle="tiny-regular" color="gray.300" mt="1">
              Also recorded with no account: {money(unassigned.moneyIn)} in,{' '}
              {money(unassigned.moneyOut)} out.
            </Text>
          )}
        </Box>
      </Stack>

      <EmailStatementModal
        open={Boolean(emailing)}
        onClose={() => setEmailing(null)}
        orgId={orgId}
        businessEmail={businessEmail}
        accountId={emailing?.accountId}
        accountLabel={emailing?.label}
        range={range}
      />
    </>
  );
}

function Fact({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      gap="3"
      bg="gray.50"
      rounded=".5rem"
      px="3"
      py="2"
    >
      <Text textStyle="tiny-regular" color="gray.400">
        {label}
      </Text>
      <Text
        textStyle="small-semibold"
        color={danger ? 'error.300' : 'gray.500'}
        textAlign="right"
      >
        {value}
      </Text>
    </Flex>
  );
}
