import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Inspection } = lazyImport(
  () => import('../pages/Inspection'),
  'Inspection'
);

export const InspectionRoutes: RouteObject[] = [
  {
    path: RouteConstants.inspection.base.path,
    element: <Inspection />,
  },
];
