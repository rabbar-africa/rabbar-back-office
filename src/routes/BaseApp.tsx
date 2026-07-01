// import SectionLoader from '@/components/common/SectionLoader';
// import SectionLoader from '@/components/common/SectionLoader';
import SectionLoader from '@/components/common/SectionLoader';
import { useGetCurrentUserQuery } from '@/features/auth/api';
import { RouteConstants } from '@/shared/constants/routes';
import { getToken, removeToken } from '@/utils/persistToken';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function BaseApp() {
  const location = useLocation();
  const token = getToken();

  const isAuthenticated = Boolean(token?.accessToken);

  const { isLoading, isSuccess, isError } = useGetCurrentUserQuery({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError) {
      removeToken();
    }
  }, [isError]);

  if (!isAuthenticated || isError) {
    return (
      <Navigate
        to={RouteConstants.auth.login.path}
        state={{ from: location }}
        replace
      />
    );
  }

  if (isLoading) {
    return <SectionLoader h={'100vh'} />;
  }

  if (isSuccess) {
    return <Outlet />;
  }

  return <SectionLoader h={'100vh'} />;
}
