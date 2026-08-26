import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryConfigType,
} from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type {
  CreateRolePayload,
  UpdateRolePayload,
} from '@/shared/interface/access';
import {
  createOrgRole,
  deleteOrgRole,
  getDefaultRoleTemplates,
  getOrgPermissionsGrouped,
  getOrgRole,
  getOrgRoles,
  getPermissionCatalog,
  syncOrgPermissions,
  syncOrgRoleDefaults,
  syncPermissionsToAllOrgs,
  syncRoleDefaultsToAllOrgs,
  updateOrgRole,
} from './service';

// ─── Platform-wide ─────────────────────────────────────────────────────────

export const useGetPermissionCatalogQuery = (
  config?: QueryConfigType<typeof getPermissionCatalog>
) =>
  useQuery({
    queryKey: [customQueryKey.access.catalog],
    queryFn: getPermissionCatalog,
    // The catalog only changes when the backend ships a code change.
    staleTime: 30 * 60 * 1000,
    ...config,
  });

export const useGetDefaultRoleTemplatesQuery = (
  config?: QueryConfigType<typeof getDefaultRoleTemplates>
) =>
  useQuery({
    queryKey: [customQueryKey.access.defaultRoles],
    queryFn: getDefaultRoleTemplates,
    staleTime: 30 * 60 * 1000,
    ...config,
  });

/**
 * A platform-wide sync touches every org's permissions and roles, so drop the
 * whole access cache rather than trying to name each org's keys.
 */
const useInvalidateAllAccess = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.access.orgRoles],
    });
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.access.orgRole],
    });
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.access.orgPermissions],
    });
  };
};

export const useSyncPermissionsToAllOrgsMutation = () => {
  const invalidate = useInvalidateAllAccess();
  return useMutation({
    mutationFn: syncPermissionsToAllOrgs,
    onSuccess: invalidate,
    meta: { successMessage: 'Permission catalog synced to all organizations' },
  });
};

export const useSyncRoleDefaultsToAllOrgsMutation = () => {
  const invalidate = useInvalidateAllAccess();
  return useMutation({
    mutationFn: syncRoleDefaultsToAllOrgs,
    onSuccess: invalidate,
    meta: { successMessage: 'Default roles pushed to all organizations' },
  });
};

// ─── Per organization ──────────────────────────────────────────────────────

export const useGetOrgRolesQuery = (
  orgId: string,
  config?: QueryConfigType<typeof getOrgRoles>
) =>
  useQuery({
    queryKey: [customQueryKey.access.orgRoles, orgId],
    queryFn: () => getOrgRoles(orgId),
    enabled: Boolean(orgId),
    ...config,
  });

export const useGetOrgRoleQuery = (
  orgId: string,
  roleId: string,
  config?: QueryConfigType<typeof getOrgRole>
) =>
  useQuery({
    queryKey: [customQueryKey.access.orgRole, orgId, roleId],
    queryFn: () => getOrgRole(orgId, roleId),
    enabled: Boolean(orgId && roleId),
    ...config,
  });

export const useGetOrgPermissionsGroupedQuery = (
  orgId: string,
  config?: QueryConfigType<typeof getOrgPermissionsGrouped>
) =>
  useQuery({
    queryKey: [customQueryKey.access.orgPermissions, orgId],
    queryFn: () => getOrgPermissionsGrouped(orgId),
    enabled: Boolean(orgId),
    ...config,
  });

/** Refresh one org's role list and any open role detail. */
const useInvalidateOrgAccess = (orgId: string) => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.access.orgRoles, orgId],
    });
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.access.orgRole, orgId],
    });
  };
};

export const useCreateOrgRoleMutation = (orgId: string) => {
  const invalidate = useInvalidateOrgAccess(orgId);
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createOrgRole(orgId, payload),
    onSuccess: invalidate,
    meta: { successMessage: 'Role created successfully' },
  });
};

export const useUpdateOrgRoleMutation = (orgId: string) => {
  const invalidate = useInvalidateOrgAccess(orgId);
  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateRolePayload;
    }) => updateOrgRole(orgId, roleId, payload),
    onSuccess: invalidate,
    meta: { successMessage: 'Role updated successfully' },
  });
};

export const useDeleteOrgRoleMutation = (orgId: string) => {
  const invalidate = useInvalidateOrgAccess(orgId);
  return useMutation({
    mutationFn: (roleId: string) => deleteOrgRole(orgId, roleId),
    onSuccess: invalidate,
    meta: { successMessage: 'Role deleted' },
  });
};

export const useSyncOrgPermissionsMutation = (orgId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncOrgPermissions(orgId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.access.orgPermissions, orgId],
      }),
    meta: { successMessage: 'Permission catalog synced to this organization' },
  });
};

export const useSyncOrgRoleDefaultsMutation = (orgId: string) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateOrgAccess(orgId);
  return useMutation({
    mutationFn: () => syncOrgRoleDefaults(orgId),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.access.orgPermissions, orgId],
      });
    },
    meta: { successMessage: 'Default roles synced to this organization' },
  });
};
