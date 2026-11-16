import { RouteConstants } from '@/shared/constants/routes';
import { DashboardIcon } from '@/assets/custom/DashboardIcon';
import { BriefCase } from '@/assets/custom/BriefCase';
import { ClipboardTextIcon } from '@/assets/custom/ClipboardTextIcon';
import { ChartBar } from '@/assets/custom/ChartBar';
import { GearIcon } from '@/assets/custom/GearIcon';
import { BuildingIcon } from '@/assets/custom/BuildingIcon';
import { ShieldIcon } from '@/assets/custom/ShieldIcon';
import { TagIcon } from '@/assets/custom/TagIcon';
import { CalendarDotsIcon } from '@/assets/custom/CalendarDotsIcon';
import { ChatCircle } from '@/assets/custom/ChatCircle';
import { UsersThree } from '@/assets/custom/UsersThree';
import { ClockCounterClockwise } from '@/assets/custom/ClockCounterClockwise';

export interface SideBarItem {
  name: string;
  icon: React.ElementType;
  href: string;
  slug: string;
  paths: string[];
  /** Super admins only: the owners (GET back-office/admins/me → canManageAdmins). */
  ownersOnly?: boolean;
}

export const sideBarItems: SideBarItem[] = [
  {
    name: 'Dashboard',
    icon: DashboardIcon,
    href: RouteConstants.overview.base.path,
    slug: 'dashboard',
    paths: [RouteConstants.overview.base.path],
  },
  {
    name: 'Organizations',
    icon: BuildingIcon,
    href: RouteConstants.organizations.base.path,
    slug: 'organizations',
    // Invoices, payments, inspections and customers are reached from a
    // business's tabs, so their pages keep Organizations highlighted.
    paths: [
      RouteConstants.organizations.base.path,
      RouteConstants.invoices.base.path,
      RouteConstants.payments.base.path,
      RouteConstants.inspection.base.path,
      RouteConstants.customers.base.path,
    ],
  },
  {
    name: 'Billing',
    icon: CalendarDotsIcon,
    href: RouteConstants.billing.base.path,
    slug: 'billing',
    paths: [RouteConstants.billing.base.path],
  },
  {
    name: 'Promo Codes',
    icon: TagIcon,
    href: RouteConstants.promoCodes.base.path,
    slug: 'promo-codes',
    paths: [RouteConstants.promoCodes.base.path],
  },
  {
    name: 'WhatsApp Bot',
    icon: ChatCircle,
    href: RouteConstants.whatsapp.base.path,
    slug: 'whatsapp',
    paths: [RouteConstants.whatsapp.base.path],
  },
  {
    name: 'Items / Services',
    icon: BriefCase,
    href: RouteConstants.items.base.path,
    slug: 'items',
    paths: [RouteConstants.items.base.path],
  },
  {
    name: 'Expense Tracking',
    icon: ClipboardTextIcon,
    href: RouteConstants.expenses.base.path,
    slug: 'expenses',
    paths: [RouteConstants.expenses.base.path],
  },
  {
    name: 'Access Control',
    icon: ShieldIcon,
    href: RouteConstants.access.base.path,
    slug: 'access-control',
    paths: [RouteConstants.access.base.path],
  },
  {
    name: 'Admins',
    icon: UsersThree,
    href: RouteConstants.admins.base.path,
    slug: 'admins',
    paths: [RouteConstants.admins.base.path],
    ownersOnly: true,
  },
  {
    name: 'Access Log',
    icon: ClockCounterClockwise,
    href: RouteConstants.accessLog.base.path,
    slug: 'access-log',
    paths: [RouteConstants.accessLog.base.path],
    ownersOnly: true,
  },
  {
    name: 'Reports',
    icon: ChartBar,
    href: RouteConstants.reports.base.path,
    slug: 'reports',
    paths: [RouteConstants.reports.base.path],
  },
  {
    name: 'Settings',
    icon: GearIcon,
    href: RouteConstants.settings.base.path,
    slug: 'settings',
    paths: [RouteConstants.settings.base.path],
  },
];
