import { Suspense, lazy, useMemo } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';
import moment from 'moment';
import type { ApexOptions } from 'apexcharts';

// ApexCharts is heavy — load it only when this chart is on screen.
const ReactApexChart = lazy(() => import('react-apexcharts'));

const SERIES_COLOR = '#013064'; // primary.500
const INK_MUTED = '#757575'; // gray.300
const GRID = '#e0e0e0'; // gray.75, one step off the white surface

interface MessagesPerDayChartProps {
  /** One entry per day, quiet days included as zero. */
  days: Array<{ day: string; messages: number }>;
}

/** Single series over time: a 2px line with a light wash, no legend needed. */
export function MessagesPerDayChart({ days }: MessagesPerDayChartProps) {
  const series = useMemo(
    () => [{ name: 'Messages', data: days.map((d) => d.messages) }],
    [days]
  );

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: 'area',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Poppins, sans-serif',
      },
      colors: [SERIES_COLOR],
      dataLabels: { enabled: false },
      stroke: { curve: 'straight', width: 2, lineCap: 'round' },
      fill: { type: 'solid', opacity: 0.1 },
      markers: {
        size: 0,
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: 5 },
      },
      grid: {
        borderColor: GRID,
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: days.map((d) => d.day),
        tickAmount: Math.min(days.length, 8),
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: {
          rotate: 0,
          hideOverlappingLabels: true,
          style: { colors: INK_MUTED, fontSize: '11px' },
          formatter: (value: string) =>
            value ? moment(value, 'YYYY-MM-DD').format('DD MMM') : '',
        },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          style: { colors: INK_MUTED, fontSize: '11px' },
          formatter: (value: number) => Math.round(value).toLocaleString(),
        },
      },
      legend: { show: false },
      tooltip: {
        x: {
          formatter: (_v, opts) => {
            const point = days[opts?.dataPointIndex ?? 0];
            return point
              ? moment(point.day, 'YYYY-MM-DD').format('dddd, DD MMM YYYY')
              : '';
          },
        },
        y: { formatter: (value: number) => value.toLocaleString() },
      },
    }),
    [days]
  );

  return (
    <Box minH="280px">
      <Suspense
        fallback={<Skeleton height="260px" rounded="md" bg="gray.50" />}
      >
        <ReactApexChart
          type="area"
          height={260}
          options={options}
          series={series}
        />
      </Suspense>
    </Box>
  );
}
