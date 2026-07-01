import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Customers } = lazyImport(
  () => import('../pages/Customers'),
  'Customers'
);

export const CustomerRoutes: RouteObject[] = [
  {
    path: RouteConstants.customers.base.path,
    element: <Customers />,
  },
];
