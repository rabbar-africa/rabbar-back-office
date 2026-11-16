import { lazyImport } from '@/utils/lazyImports';
import { Outlet, type RouteObject } from 'react-router-dom';
import Layout from '../components/Layout';
import { RouteError } from '@/components/error';
import { RouteConstants } from '@/shared/constants/routes';
const { Login } = lazyImport(() => import('../components/Login'), 'Login');
const { AcceptInvite } = lazyImport(
  () => import('../components/AcceptInvite'),
  'AcceptInvite'
);

export const AuthRouteList: RouteObject[] = [
  {
    path: RouteConstants.auth.login.path,
    element: <Login />,
  },
  {
    // Public: the admin invite email links here.
    path: RouteConstants.auth.acceptInvite.path,
    element: <AcceptInvite />,
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
