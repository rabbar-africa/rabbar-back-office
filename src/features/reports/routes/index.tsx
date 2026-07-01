import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Reports } = lazyImport(() => import('../pages/Reports'), 'Reports');

export const ReportRoutes: RouteObject[] = [
  {
    path: RouteConstants.reports.base.path,
    element: <Reports />,
  },
];
