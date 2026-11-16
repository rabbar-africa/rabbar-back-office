import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { MutationConfig, QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IAccessLogFilter } from '@/shared/interface/admin';
import { adminsService } from './service';
import { setAccessToken, setRefreshToken } from '@/utils/persistToken';
import { RouteConstants } from '@/shared/constants/routes';

/**
 * What the signed-in admin may do. Cached for the session: it only changes
 * when the owner list in the API's environment does.
 */
export function useAdminPermissions() {
  const query = useQuery({
    queryKey: [customQueryKey.admins.me],
    queryFn: adminsService.getMe,
    staleTime: Infinity,
  });
  return {
    canManageAdmins: query.data?.canManageAdmins ?? false,
    isPending: query.isPending,
  };
}

export function useGetAdmins(
  config?: QueryConfigType<typeof adminsService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.admins.getAll],
    queryFn: adminsService.getAll,
    ...config,
  });
}

export function useCreateAdmin(
  config?: MutationConfig<typeof adminsService.create>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminsService.create,
    meta: {
      successMessage:
        'Invite sent. The link works for 48 hours and can be used once.',
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.admins.getAll],
      }),
    ...config,
  });
}

export function useSetAdminActive(
  config?: MutationConfig<typeof adminsService.setActive>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminsService.setActive,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.admins.getAll],
      }),
    ...config,
  });
}

export function useResendAdminInvite(
  config?: MutationConfig<typeof adminsService.resendInvite>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminsService.resendInvite,
    meta: {
      successMessage: 'A new link was emailed. The old one no longer works.',
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.admins.getAll],
      }),
    ...config,
  });
}

export function useCancelAdminInvite(
  config?: MutationConfig<typeof adminsService.cancelInvite>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminsService.cancelInvite,
    meta: { successMessage: 'Invite cancelled. The link no longer works.' },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.admins.getAll],
      }),
    ...config,
  });
}

/** Public accept page: who the invite is for. */
export function useGetAdminInvite(token: string) {
  return useQuery({
    queryKey: [customQueryKey.admins.invite, token],
    queryFn: () => adminsService.getInvite(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });
}

/** Accepting the invite signs them in. */
export function useAcceptAdminInvite() {
  return useMutation({
    mutationFn: adminsService.acceptInvite,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      window.location.replace(RouteConstants.overview.base.path);
    },
  });
}

/** The access log, newest first, one cursor page at a time. */
export function useGetAccessLog(
  filter: Omit<IAccessLogFilter, 'cursor'>,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: [customQueryKey.admins.accessLog, filter],
    queryFn: ({ pageParam }) =>
      adminsService.getAccessLog({
        ...filter,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: '' as string,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: options?.enabled ?? true,
  });
}
