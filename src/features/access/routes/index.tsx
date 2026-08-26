import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { AccessControlPage } = lazyImport(
  () => import('../pages/AccessControlPage'),
  'AccessControlPage'
);

export const AccessRoutes: RouteObject[] = [
  {
    path: RouteConstants.access.base.path,
    element: <AccessControlPage />,
  },
];
