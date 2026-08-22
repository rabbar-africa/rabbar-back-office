import { Box, Flex, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { formatMoney } from '@/hooks/useFormatMoney';
import { addComma } from '@/utils/format-number';
import type { IOverviewResponse } from '@/shared/interface/overview';
import { MiniStat, StatCard } from './StatCard';
import { SectionCard } from './SectionCard';
import { MoneyPanel } from './MoneyPanel';
import { GrowthTrendChart } from './GrowthTrendChart';
import { SubscriptionsPanel } from './SubscriptionsPanel';
import { TopActiveOrgs } from './TopActiveOrgs';
import { RecentOrganizations } from './RecentOrganizations';

const count = (value: number) => addComma(value);

/** Percentage of `part` within `whole`, rendered as "42%" (or "—" when N/A). */
const share = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—';

interface OverviewContentProps {
  overview: IOverviewResponse;
  trendMonths: number;
}

/**
 * The data-bearing half of the dashboard. Split out from the template so the
 * page header and period filters can render immediately while this is still
 * loading — see OverviewSkeleton, which mirrors this layout exactly.
 */
export function OverviewContent({
  overview,
  trendMonths,
}: OverviewContentProps) {
  const {
    organizations,
    users,
    platformTotals,
    activityInPeriod,
    money,
    subscriptions,
    trend,
    topActiveOrgs,
    recentOrganizations,
  } = overview;

  // The largest currency by amount stands in for the headline money figures;
  // the full per-currency split lives in MoneyPanel below.
  const topInvoiced = money.invoiced?.[0];
  const topCollected = money.collected?.find(
    (entry) => entry.currency === topInvoiced?.currency
  );

  const totalActivity =
    activityInPeriod.inspections +
    activityInPeriod.invoices +
    activityInPeriod.paymentsReceived +
    activityInPeriod.expenses +
    activityInPeriod.jobCards;

  return (
    <Stack gap="1.5rem">
      {/* Headline KPIs */}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="1rem">
        <StatCard
          label="Organizations"
          value={count(organizations.total)}
          helperText={`${count(organizations.active)} active · ${count(organizations.inactive)} inactive`}
          badge={
            <Text textStyle="tiny-regular" color="success.300" fontWeight="600">
              +{count(organizations.newInPeriod)} new
            </Text>
          }
        />
        <StatCard
          label="Users"
          value={count(users.total)}
          helperText="Excludes platform admins"
          accent="secondary.400"
          badge={
            <Text textStyle="tiny-regular" color="success.300" fontWeight="600">
              +{count(users.newInPeriod)} new
            </Text>
          }
        />
        <StatCard
          label={`Invoiced${topInvoiced ? ` (${topInvoiced.currency})` : ''}`}
          value={
            topInvoiced
              ? formatMoney(topInvoiced.amount, {
                  currencyCode: topInvoiced.currency,
                })
              : '—'
          }
          helperText={
            topInvoiced
              ? `${count(topInvoiced.count)} invoice${topInvoiced.count === 1 ? '' : 's'} in period`
              : 'No invoices in period'
          }
          accent="warning.400"
        />
        <StatCard
          label={`Collected${topCollected ? ` (${topCollected.currency})` : ''}`}
          value={
            topCollected
              ? formatMoney(topCollected.amount, {
                  currencyCode: topCollected.currency,
                })
              : '—'
          }
          helperText={
            topInvoiced
              ? `${share(topCollected?.amount ?? 0, topInvoiced.amount)} of invoiced`
              : 'No payments in period'
          }
          accent="success.300"
        />
      </SimpleGrid>

      {/* Engagement — how much of the platform is actually being used */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="1rem">
        <StatCard
          label="Active in period"
          value={count(organizations.activeInPeriod)}
          helperText={`${share(organizations.activeInPeriod, organizations.total)} of all organizations created records`}
          accent="success.300"
        />
        <StatCard
          label="Dormant (30 days)"
          value={count(organizations.dormantLast30Days)}
          helperText={`${share(organizations.dormantLast30Days, organizations.total)} of organizations with no recent activity`}
          accent="error.300"
        />
        <StatCard
          label="Records created"
          value={count(totalActivity)}
          helperText="Across inspections, invoices, payments, expenses and job cards"
          accent="primary.300"
        />
      </SimpleGrid>

      {/* Volume tiles */}
      <SectionCard
        title="Activity in period"
        subtitle="New records created between the selected dates"
      >
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap="1rem">
          <MiniStat
            label="Inspections"
            value={count(activityInPeriod.inspections)}
          />
          <MiniStat label="Invoices" value={count(activityInPeriod.invoices)} />
          <MiniStat
            label="Payments received"
            value={count(activityInPeriod.paymentsReceived)}
          />
          <MiniStat label="Expenses" value={count(activityInPeriod.expenses)} />
          <MiniStat
            label="Job cards"
            value={count(activityInPeriod.jobCards)}
          />
        </SimpleGrid>
      </SectionCard>

      <SectionCard
        title="Platform totals"
        subtitle="All-time record counts across every organization"
      >
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap="1rem">
          <MiniStat label="Clients" value={count(platformTotals.clients)} />
          <MiniStat label="Vehicles" value={count(platformTotals.vehicles)} />
          <MiniStat
            label="Inspections"
            value={count(platformTotals.inspections)}
          />
          <MiniStat label="Invoices" value={count(platformTotals.invoices)} />
          <MiniStat label="Job cards" value={count(platformTotals.jobCards)} />
        </SimpleGrid>
      </SectionCard>

      <GrowthTrendChart trend={trend} months={trendMonths} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="1.5rem">
        <MoneyPanel money={money} />
        <SubscriptionsPanel subscriptions={subscriptions} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="1.5rem">
        <TopActiveOrgs orgs={topActiveOrgs} />
        <RecentOrganizations organizations={recentOrganizations} />
      </SimpleGrid>

      <Box>
        <Flex justify="center">
          <Text textStyle="tiny-regular" color="gray.200">
            Figures marked “in period” follow the date range above; totals are
            all-time.
          </Text>
        </Flex>
      </Box>
    </Stack>
  );
}
