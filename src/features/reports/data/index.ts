export interface IReportCard {
  id: string;
  title: string;
  description: string;
  value: string;
}

export const reportsData: IReportCard[] = [
  {
    id: '1',
    title: 'Sales Summary',
    description: 'Revenue by period, customer and item.',
    value: 'NGN 12,450,000',
  },
  {
    id: '2',
    title: 'Outstanding Receivables',
    description: 'Unpaid and overdue invoice balances.',
    value: 'NGN 3,120,000',
  },
  {
    id: '3',
    title: 'Expense Breakdown',
    description: 'Spend grouped by category and vendor.',
    value: 'NGN 2,340,000',
  },
  {
    id: '4',
    title: 'Profit & Loss',
    description: 'Net profit across the current fiscal period.',
    value: 'NGN 6,990,000',
  },
];
