import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { PromoCodes } = lazyImport(
  () => import('../pages/PromoCodes'),
  'PromoCodes'
);
const { PromoCodeDetail } = lazyImport(
  () => import('../pages/PromoCodeDetail'),
  'PromoCodeDetail'
);

export const PromoCodeRoutes: RouteObject[] = [
  {
    path: RouteConstants.promoCodes.base.path,
    element: <PromoCodes />,
  },
  {
    path: RouteConstants.promoCodes.detail.path,
    element: <PromoCodeDetail />,
  },
];
