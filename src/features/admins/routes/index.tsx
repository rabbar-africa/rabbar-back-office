import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Admins } = lazyImport(() => import('../pages/Admins'), 'Admins');
const { AccessLog } = lazyImport(
  () => import('../pages/AccessLog'),
  'AccessLog'
);

export const AdminRoutes: RouteObject[] = [
  {
    path: RouteConstants.admins.base.path,
    element: <Admins />,
  },
  {
    path: RouteConstants.accessLog.base.path,
    element: <AccessLog />,
  },
];
