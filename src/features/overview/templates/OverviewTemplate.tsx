import { Button, Center, Stack, Text } from '@chakra-ui/react';
import moment from 'moment';
import { PageHeader } from '@/components/common/PageHeader';
import { useOverview } from '../components/useOverview';
import { OverviewFilters } from '../components/OverviewFilters';
import { OverviewSkeleton } from '../components/OverviewSkeleton';
import { OverviewContent } from '../components/OverviewContent';

const DAY = 'DD MMM YYYY';

/**
 * Period caption for the header. Uses the range the API echoed back once it
 * has replied, and the pending filter values (or the API's own default —
 * the current month) while it hasn't.
 */
function periodCaption(
  period: { from: string; to: string } | undefined,
  filters: { from: string; to: string }
) {
  if (period) {
    return `${moment(period.from).format(DAY)} — ${moment(period.to).format(DAY)}`;
  }
  if (filters.from || filters.to) {
    const from = filters.from ? moment(filters.from).format(DAY) : '…';
    const to = filters.to ? moment(filters.to).format(DAY) : 'today';
    return `${from} — ${to}`;
  }
  return moment().format('MMMM YYYY');
}

export function OverviewTemplate() {
  const {
    overview,
    isLoading,
    isFetching,
    isError,
    refetch,
    filters,
    setFilters,
    activePreset,
    applyPreset,
    resetPeriod,
  } = useOverview();

  const caption = periodCaption(overview?.period, filters);

  return (
    <Stack gap="1.5rem">
      {/* Header and filters render immediately so the period stays adjustable
          while the figures are still in flight. */}
      <PageHeader
        title="Dashboard"
        subtitle={`Platform overview · ${caption}${
          isFetching && !isLoading ? ' · refreshing…' : ''
        }`}
      />

      <OverviewFilters
        from={filters.from}
        to={filters.to}
        trendMonths={filters.trendMonths}
        activePreset={activePreset}
        onPresetChange={applyPreset}
        onFromChange={(value) => setFilters({ from: value })}
        onToChange={(value) => setFilters({ to: value })}
        onTrendMonthsChange={(value) => setFilters({ trendMonths: value })}
        onReset={resetPeriod}
      />

      {isLoading ? (
        <OverviewSkeleton />
      ) : isError || !overview ? (
        <Center py="16">
          <Stack gap="3" align="center">
            <Text textStyle="small-regular" color="error.300">
              Couldn&apos;t load the dashboard.
            </Text>
            <Button
              size="sm"
              variant="outlineSecondary"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </Stack>
        </Center>
      ) : (
        <OverviewContent
          overview={overview}
          trendMonths={filters.trendMonths}
        />
      )}
    </Stack>
  );
}
