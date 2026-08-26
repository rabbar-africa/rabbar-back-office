import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { InvoiceListPage } = lazyImport(
  () => import('../pages/InvoiceListPage'),
  'InvoiceListPage'
);
const { InvoiceDetailPage } = lazyImport(
  () => import('../pages/InvoiceDetailPage'),
  'InvoiceDetailPage'
);
export const InvoiceRoutes: RouteObject[] = [
  {
    path: RouteConstants.invoices.base.path,
    element: <InvoiceListPage />,
  },
  {
    path: RouteConstants.invoices.detail.path,
    element: <InvoiceDetailPage />,
  },
];
