import { Suspense, lazy, useMemo } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';
import moment from 'moment';
import type { ApexOptions } from 'apexcharts';
import type { IOverviewTrendPoint } from '@/shared/interface/overview';
import { SectionCard } from './SectionCard';

// ApexCharts is a heavy dependency and this is the only chart on the page —
// load it on demand so it stays out of the initial dashboard bundle.
const ReactApexChart = lazy(() => import('react-apexcharts'));

const SERIES_META = [
  { key: 'newOrganizations', name: 'New organizations', color: '#013064' },
  { key: 'newUsers', name: 'New users', color: '#2fa346' },
  { key: 'inspections', name: 'Inspections', color: '#ffa500' },
  { key: 'invoices', name: 'Invoices', color: '#4d77a8' },
] as const;

interface GrowthTrendChartProps {
  trend: IOverviewTrendPoint[];
  months: number;
}

export function GrowthTrendChart({ trend, months }: GrowthTrendChartProps) {
  const series = useMemo(
    () =>
      SERIES_META.map((meta) => ({
        name: meta.name,
        data: trend.map((point) => point[meta.key]),
      })),
    [trend]
  );

  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: 'area',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Poppins, sans-serif',
        animations: { enabled: true },
      },
      colors: SERIES_META.map((meta) => meta.color),
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.25, opacityTo: 0, stops: [0, 100] },
      },
      grid: { borderColor: '#F4F4F4', strokeDashArray: 4 },
      xaxis: {
        categories: trend.map((point) =>
          moment(point.month, 'YYYY-MM').format('MMM YY')
        ),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#757575', fontSize: '11px' } },
      },
      yaxis: {
        labels: {
          style: { colors: '#757575', fontSize: '11px' },
          formatter: (value: number) => String(Math.round(value)),
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        markers: { size: 6 },
        fontSize: '12px',
        labels: { colors: '#424242' },
      },
      tooltip: {
        x: {
          formatter: (_v, opts) => {
            const point = trend[opts?.dataPointIndex ?? 0];
            return point
              ? moment(point.month, 'YYYY-MM').format('MMMM YYYY')
              : '';
          },
        },
      },
    }),
    [trend]
  );

  return (
    <SectionCard
      title="Growth trend"
      subtitle={`New records per month over the last ${months} months`}
    >
      <Box minH="320px">
        <Suspense
          fallback={<Skeleton height="300px" rounded="md" bg="gray.50" />}
        >
          <ReactApexChart
            type="area"
            height={300}
            options={options}
            series={series}
          />
        </Suspense>
      </Box>
    </SectionCard>
  );
}
