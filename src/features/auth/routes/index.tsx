import { lazyImport } from '@/utils/lazyImports';
import { Outlet, type RouteObject } from 'react-router-dom';
import Layout from '../components/Layout';
import { RouteError } from '@/components/error';
import { RouteConstants } from '@/shared/constants/routes';
const { Login } = lazyImport(() => import('../components/Login'), 'Login');

export const AuthRouteList: RouteObject[] = [
  {
    path: RouteConstants.auth.login.path,
    element: <Login />,
  },
];

const AuthPagesRouteOutlet = (
  <Layout>
    <Outlet />
  </Layout>
);
export const AuthRoutes: RouteObject = {
  path: '',
  element: AuthPagesRouteOutlet,
  errorElement: <RouteError />,
  children: AuthRouteList,
};
