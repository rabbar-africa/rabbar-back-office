import { useState } from 'react';
import { Box, Button, Center, Flex, Stack, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { RefreshButton } from '@/components/common/RefreshButton';
import { CustomSelect } from '@/components/input';
import { RouteConstants } from '@/shared/constants/routes';
import { customQueryKey } from '@/shared/constants/query-keys';
import { formatAccountLabel } from '@/shared/interface/banking';
import { useGetOrganizationById } from '@/features/organizations/api/query';
import {
  useDownloadStatementPdf,
  useGetAccountStatement,
  useGetOrgAccounts,
} from '../api';
import {
  StatementRangePicker,
  useStatementRange,
} from '../components/StatementRangePicker';
import { StatementSummary, balanceTiles } from '../components/StatementSummary';
import { StatementTable } from '../components/StatementTable';
import { EmailStatementModal } from '../components/EmailStatementModal';

const formatDay = (day: string) => moment(day).format('DD MMM YYYY');

/** One account's statement for one organization, with a running balance. */
export function AccountStatementTemplate() {
  const { id: orgId = '', accountId = '' } = useParams<{
    id: string;
    accountId: string;
  }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [emailOpen, setEmailOpen] = useState(false);
  const { preset, range, setRange } = useStatementRange();

  const { data: orgData } = useGetOrganizationById(orgId);
  const organization = orgData?.data;
  const { data: accountsData, isLoading: accountsLoading } =
    useGetOrgAccounts(orgId);
  const accountOptions = (accountsData?.data ?? []).map((account) => ({
    label: formatAccountLabel(account),
    value: account.id,
  }));

  const { data, isLoading, isFetching, isError } = useGetAccountStatement(
    orgId,
    accountId,
    range
  );
  const statement = data?.data;
  const download = useDownloadStatementPdf();

  // Back to the organization's Banking tab, same period.
  const goBack = () => {
    const params = new URLSearchParams(search);
    params.set('tab', 'banking');
    navigate(
      `${RouteConstants.organizations.detail.generate({ id: orgId })}?${params}`
    );
  };

  const subtitle = statement
    ? `${organization?.name ? `${organization.name} · ` : ''}${formatAccountLabel(
        statement.account
      )} · ${formatDay(statement.period.from)} – ${formatDay(
        statement.period.to
      )}`
    : 'Money in and out of an account, with a running balance';

  return (
    <>
      <Stack gap="6" pb="3rem">
        <Box>
          <Button
            variant="ghost"
            size="xs"
            px="1"
            mb="2"
            color="primary.300"
            onClick={goBack}
          >
            ← {organization?.name ?? 'Organization'} · Banking
          </Button>
          <PageHeader
            title="Account Statement"
            subtitle={subtitle}
            action={
              <Flex gap="2" flexWrap="wrap">
                <Button
                  variant="outline"
                  disabled={!statement}
                  onClick={() => setEmailOpen(true)}
                >
                  Email to the business
                </Button>
                <Button
                  bg="primary.300"
                  color="white"
                  _hover={{ bg: 'primary.400' }}
                  loading={download.isPending}
                  disabled={!statement}
                  onClick={() => download.mutate({ orgId, accountId, range })}
                >
                  Download PDF
                </Button>
              </Flex>
            }
          />
        </Box>

        <Flex
          gap="3"
          align={{ base: 'stretch', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          wrap="wrap"
        >
          <CustomSelect
            options={accountOptions}
            loading={accountsLoading}
            value={accountId ? [accountId] : undefined}
            onChange={(opt: { value: string[] }) => {
              const next = opt?.value?.[0];
              // Same period, another account.
              if (next && next !== accountId)
                navigate(
                  `${RouteConstants.organizations.statement.generate({
                    id: orgId,
                    accountId: next,
                  })}${search}`
                );
            }}
            rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
            controlProps={{ w: { base: '100%', md: '260px' } }}
          />
          <StatementRangePicker
            preset={preset}
            range={range}
            onChange={setRange}
          />
          <RefreshButton
            queryKeys={[[customQueryKey.banking.statement, orgId, accountId]]}
            label="Reload statement"
            ml={{ md: 'auto' }}
          />
        </Flex>

        {isError ? (
          <Center py="10">
            <Text color="error.300">Couldn&apos;t load this statement.</Text>
          </Center>
        ) : (
          <>
            {statement && (
              <StatementSummary
                currencyCode={statement.currencyCode}
                tiles={balanceTiles({
                  openingBalance: statement.openingBalance,
                  moneyIn: statement.totals.moneyIn,
                  moneyOut: statement.totals.moneyOut,
                  closingBalance: statement.closingBalance,
                })}
              />
            )}

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
              <Box overflowX="auto" minW={0}>
                <StatementTable
                  statement={statement}
                  orgId={orgId}
                  orgName={organization?.name}
                  isLoading={isLoading}
                />
              </Box>
              {statement && statement.lines.length === 0 && (
                <Center pt="4">
                  <Text fontSize="13px" color="gray.300">
                    No money in or out in this period.
                  </Text>
                </Center>
              )}
            </Box>
          </>
        )}
      </Stack>

      <EmailStatementModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        orgId={orgId}
        businessEmail={organization?.companyEmail || organization?.email}
        accountId={accountId}
        accountLabel={statement ? formatAccountLabel(statement.account) : ''}
        range={range}
      />
    </>
  );
}
