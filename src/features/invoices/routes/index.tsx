import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Invoices } = lazyImport(() => import('../pages/Invoices'), 'Invoices');

export const InvoiceRoutes: RouteObject[] = [
  {
    path: RouteConstants.invoices.base.path,
    element: <Invoices />,
  },
];
