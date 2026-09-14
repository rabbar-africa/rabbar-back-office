import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Billing } = lazyImport(() => import('../pages/Billing'), 'Billing');

export const BillingRoutes: RouteObject[] = [
  {
    path: RouteConstants.billing.base.path,
    element: <Billing />,
  },
];
