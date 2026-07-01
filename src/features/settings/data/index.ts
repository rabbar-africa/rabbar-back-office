import { RouteConstants } from '@/shared/constants/routes';

export interface ISettingsSection {
  id: string;
  title: string;
  description: string;
  href: string;
}

export const settingsSections: ISettingsSection[] = [
  {
    id: '1',
    title: 'General',
    description: 'Fiscal year, date format and org preferences.',
    href: RouteConstants.settings.generalConfig.path,
  },
  {
    id: '2',
    title: 'Profile',
    description: 'Your personal account details.',
    href: RouteConstants.settings.profile.path,
  },
  {
    id: '3',
    title: 'Currency',
    description: 'Base and supported currencies.',
    href: RouteConstants.settings.currency.path,
  },
  {
    id: '4',
    title: 'Taxes',
    description: 'Tax rates applied to invoices.',
    href: RouteConstants.settings.taxes.path,
  },
  {
    id: '5',
    title: 'Team Management',
    description: 'Invite members and manage roles.',
    href: RouteConstants.settings.teamManagement.path,
  },
  {
    id: '6',
    title: 'Transaction Series',
    description: 'Numbering series for documents.',
    href: RouteConstants.settings.transactionSeries.path,
  },
];
