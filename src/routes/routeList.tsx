import { AuthRoutes } from '@/features/auth/routes';
import { LandingPageRoutes } from '@/features/landing/routes';
import { type RouteObject } from 'react-router-dom';
import { RouteError } from '@/components/error';
import { BaseApp } from './BaseApp';

export const RoutesList: RouteObject[] = [
  {
    path: '',
    element: <BaseApp />,
    errorElement: <RouteError />,
    children: [LandingPageRoutes, AuthRoutes],
  },
  {
    path: '*',
    element: <div>Not Found</div>,
  },
];
