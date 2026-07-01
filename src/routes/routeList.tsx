import { AuthRoutes } from '@/features/auth/routes';
import { type RouteObject } from 'react-router-dom';
import { RouteError } from '@/components/error';
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
  {
    path: '*',
    element: <div>Not Found</div>,
  },
];
