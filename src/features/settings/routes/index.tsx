import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Settings } = lazyImport(() => import('../pages/Settings'), 'Settings');

export const SettingsRoutes: RouteObject[] = [
  {
    path: RouteConstants.settings.base.path,
    element: <Settings />,
  },
];
