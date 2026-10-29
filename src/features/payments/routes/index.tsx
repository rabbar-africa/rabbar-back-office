import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Payments } = lazyImport(() => import('../pages/Payments'), 'Payments');
const { PaymentDetail } = lazyImport(
  () => import('../pages/PaymentDetail'),
  'PaymentDetail'
);

export const PaymentRoutes: RouteObject[] = [
  {
    path: RouteConstants.payments.base.path,
    element: <Payments />,
  },
  {
    path: RouteConstants.payments.detail.path,
    element: <PaymentDetail />,
  },
];
