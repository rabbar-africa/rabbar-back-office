import { useMemo } from 'react';
import moment from 'moment';
import { useUrlState } from '@/hooks/useUrlState';
import { useGetOverviewQuery } from '../api';

const FILTER_SCHEMA = {
  from: { defaultValue: '' },
  to: { defaultValue: '' },
  trendMonths: { defaultValue: 12 },
};

/** Quick period presets — the API defaults to the current month when unset. */
export const PERIOD_PRESETS = [
  { label: 'This month', value: 'month' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Year to date', value: 'ytd' },
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number]['value'];

const ISO_DAY = 'YYYY-MM-DD';

function presetRange(preset: PeriodPreset) {
  const to = moment().format(ISO_DAY);
  switch (preset) {
    case '30d':
      return { from: moment().subtract(29, 'days').format(ISO_DAY), to };
    case '90d':
      return { from: moment().subtract(89, 'days').format(ISO_DAY), to };
    case 'ytd':
      return { from: moment().startOf('year').format(ISO_DAY), to };
    case 'month':
    default:
      return { from: moment().startOf('month').format(ISO_DAY), to };
  }
}

export function useOverview() {
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });

  const { data, isLoading, isFetching, isError, refetch } = useGetOverviewQuery(
    {
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
      trendMonths: filters.trendMonths,
    }
  );

  const overview = data?.data;

  /** Which preset (if any) the current from/to pair matches. */
  const activePreset = useMemo<PeriodPreset | ''>(() => {
    if (!filters.from && !filters.to) return 'month';
    const match = PERIOD_PRESETS.find((preset) => {
      const range = presetRange(preset.value);
      return range.from === filters.from && range.to === filters.to;
    });
    return match?.value ?? '';
  }, [filters.from, filters.to]);

  const applyPreset = (preset: PeriodPreset) => setFilters(presetRange(preset));

  const resetPeriod = () => setFilters({ from: '', to: '' });

  return {
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
  };
}
