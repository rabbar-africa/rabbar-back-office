import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Settings } = lazyImport(() => import('../pages/Settings'), 'Settings');
const { SignInSecurityPage } = lazyImport(
  () => import('../pages/SignInSecurityPage'),
  'SignInSecurityPage'
);

export const SettingsRoutes: RouteObject[] = [
  {
    path: RouteConstants.settings.base.path,
    element: <Settings />,
  },
  {
    path: RouteConstants.settings.security.path,
    element: <SignInSecurityPage />,
  },
];
