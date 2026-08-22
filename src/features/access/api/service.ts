import { axios } from '@/lib/axios';
import type { ApiResponse } from '@/shared/interface/api';
import type {
  CreateRolePayload,
  IDefaultRoleTemplates,
  IPermission,
  IPermissionCatalog,
  IPermissionGroup,
  IPermissionSyncAllResult,
  IPermissionSyncResult,
  IRole,
  IRoleSeedResult,
  IRoleSyncAllResult,
  UpdateRolePayload,
} from '@/shared/interface/access';

const GLOBAL_PATH = 'back-office/access';
const orgPath = (orgId: string) => `back-office/organizations/${orgId}`;

// ─── Platform-wide ─────────────────────────────────────────────────────────

/** The code-defined permission catalog every org's rows are seeded from. */
export const getPermissionCatalog = async () => {
  const response = await axios.get<ApiResponse<IPermissionCatalog>>(
    `${GLOBAL_PATH}/catalog`
  );
  return response.data;
};

/** The default role templates a sync pushes into every org. */
export const getDefaultRoleTemplates = async () => {
  const response = await axios.get<ApiResponse<IDefaultRoleTemplates>>(
    `${GLOBAL_PATH}/default-roles`
  );
  return response.data;
};

/** Seed missing catalog permissions into every organization. */
export const syncPermissionsToAllOrgs = async () => {
  const response = await axios.post<ApiResponse<IPermissionSyncAllResult>>(
    `${GLOBAL_PATH}/permissions/sync`
  );
  return response.data;
};

/** Push the catalog + default role templates to every organization. */
export const syncRoleDefaultsToAllOrgs = async () => {
  const response = await axios.post<ApiResponse<IRoleSyncAllResult>>(
    `${GLOBAL_PATH}/roles/sync-defaults`
  );
  return response.data;
};

// ─── Per organization ──────────────────────────────────────────────────────

export const getOrgRoles = async (orgId: string) => {
  const response = await axios.get<ApiResponse<IRole[]>>(
    `${orgPath(orgId)}/roles`
  );
  return response.data;
};

export const getOrgRole = async (orgId: string, roleId: string) => {
  const response = await axios.get<ApiResponse<IRole>>(
    `${orgPath(orgId)}/roles/${roleId}`
  );
  return response.data;
};

/** The org's permission rows grouped by subject — drives the role matrix. */
export const getOrgPermissionsGrouped = async (orgId: string) => {
  const response = await axios.get<ApiResponse<IPermissionGroup[]>>(
    `${orgPath(orgId)}/permissions/grouped`
  );
  return response.data;
};

export const getOrgPermissions = async (orgId: string) => {
  const response = await axios.get<ApiResponse<IPermission[]>>(
    `${orgPath(orgId)}/permissions`
  );
  return response.data;
};

export const createOrgRole = async (
  orgId: string,
  payload: CreateRolePayload
) => {
  const response = await axios.post<ApiResponse<IRole>>(
    `${orgPath(orgId)}/roles`,
    payload
  );
  return response.data;
};

export const updateOrgRole = async (
  orgId: string,
  roleId: string,
  payload: UpdateRolePayload
) => {
  const response = await axios.put<ApiResponse<IRole>>(
    `${orgPath(orgId)}/roles/${roleId}`,
    payload
  );
  return response.data;
};

/** Replaces the role's permission set wholesale. */
export const assignRolePermissions = async (
  orgId: string,
  roleId: string,
  permissionIds: string[]
) => {
  const response = await axios.put<ApiResponse<IRole>>(
    `${orgPath(orgId)}/roles/${roleId}/permissions`,
    { permissionIds }
  );
  return response.data;
};

export const deleteOrgRole = async (orgId: string, roleId: string) => {
  const response = await axios.delete<ApiResponse<{ message: string }>>(
    `${orgPath(orgId)}/roles/${roleId}`
  );
  return response.data;
};

/** Seed missing catalog permissions into this org. */
export const syncOrgPermissions = async (orgId: string) => {
  const response = await axios.post<ApiResponse<IPermissionSyncResult>>(
    `${orgPath(orgId)}/permissions/sync`
  );
  return response.data;
};

/** Seed/re-sync the catalog + default roles for this org. */
export const syncOrgRoleDefaults = async (orgId: string) => {
  const response = await axios.post<ApiResponse<IRoleSeedResult>>(
    `${orgPath(orgId)}/roles/sync-defaults`
  );
  return response.data;
};
