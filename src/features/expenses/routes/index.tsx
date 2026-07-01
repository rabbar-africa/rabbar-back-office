import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Expenses } = lazyImport(() => import('../pages/Expenses'), 'Expenses');

export const ExpenseRoutes: RouteObject[] = [
  {
    path: RouteConstants.expenses.base.path,
    element: <Expenses />,
  },
];
