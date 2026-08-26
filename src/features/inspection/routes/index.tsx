import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { InspectionListPage } = lazyImport(
  () => import('../pages/InspectionListPage'),
  'InspectionListPage'
);
const { InspectionDetailPage } = lazyImport(
  () => import('../pages/InspectionDetailPage'),
  'InspectionDetailPage'
);

export const InspectionRoutes: RouteObject[] = [
  {
    path: RouteConstants.inspection.base.path,
    element: <InspectionListPage />,
  },
  {
    path: RouteConstants.inspection.detail.path,
    element: <InspectionDetailPage />,
  },
];
