export interface IOverviewCard {
  id: string;
  label: string;
  value: string;
  helperText: string;
  trend: 'up' | 'down';
  percentage: string;
}
