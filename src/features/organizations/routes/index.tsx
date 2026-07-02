import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Organizations } = lazyImport(
  () => import('../pages/Organizations'),
  'Organizations'
);
const { OrganizationDetails } = lazyImport(
  () => import('../pages/OrganizationDetails'),
  'OrganizationDetails'
);

export const OrganizationRoutes: RouteObject[] = [
  {
    path: RouteConstants.organizations.base.path,
    element: <Organizations />,
  },
  {
    path: RouteConstants.organizations.detail.path,
    element: <OrganizationDetails />,
  },
];
