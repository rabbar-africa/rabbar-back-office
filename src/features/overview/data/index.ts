import type { IOverviewCard } from '@/shared/interface/overview';

export const overviewStats: IOverviewCard[] = [
  {
    id: '1',
    label: 'Total Revenue',
    value: 'NGN 12,450,000',
    helperText: 'vs last month',
    trend: 'up',
    percentage: '12.5%',
  },
  {
    id: '2',
    label: 'Outstanding Invoices',
    value: 'NGN 3,120,000',
    helperText: 'vs last month',
    trend: 'down',
    percentage: '4.2%',
  },
  {
    id: '3',
    label: 'Active Customers',
    value: '1,284',
    helperText: 'vs last month',
    trend: 'up',
    percentage: '8.1%',
  },
  {
    id: '4',
    label: 'Total Expenses',
    value: 'NGN 2,340,000',
    helperText: 'vs last month',
    trend: 'up',
    percentage: '3.7%',
  },
];
