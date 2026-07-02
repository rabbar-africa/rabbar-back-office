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
const { OrganizationEdit } = lazyImport(
  () => import('../pages/OrganizationEdit'),
  'OrganizationEdit'
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
  {
    path: RouteConstants.organizations.edit.path,
    element: <OrganizationEdit />,
  },
];
