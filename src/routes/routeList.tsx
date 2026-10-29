import { AuthRoutes } from '@/features/auth/routes';
import { type RouteObject } from 'react-router-dom';
import { NotFound, RouteError } from '@/components/error';
import { BaseApp } from './BaseApp';
import { DashboardRoutes } from './DashboardRoutes';

export const RoutesList: RouteObject[] = [
  {
    path: '',
    element: <BaseApp />,
    errorElement: <RouteError />,
    children: [DashboardRoutes],
  },
  AuthRoutes,
  // Fallback outside the app; unknown dashboard addresses are caught by the
  // `*` route inside DashboardRoutes, so they keep the sidebar.
  {
    path: '*',
    element: <NotFound fullPage />,
  },
];
