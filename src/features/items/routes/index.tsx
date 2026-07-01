import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Items } = lazyImport(() => import('../pages/Items'), 'Items');

export const ItemRoutes: RouteObject[] = [
  {
    path: RouteConstants.items.base.path,
    element: <Items />,
  },
];
