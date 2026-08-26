/**
 * Access control — roles and permissions.
 *
 * Permissions are platform-defined: the backend owns a code-level catalog
 * (`PERMISSION_CATALOG`) and seeds a per-organization copy of every row.
 * Organizations can only READ their permissions and attach them to roles, so
 * the back office manages the catalog centrally and pushes it out via sync.
 *
 * Mirrors `BackOfficeAccessController` (`/back-office/access/*` and
 * `/back-office/organizations/:orgId/{roles,permissions}`).
 */

/** Keep in sync with `PERMISSION_ACTIONS` on the backend. */
export const PERMISSION_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** One permission row belonging to an organization. */
export interface IPermission {
  id: string;
  action: string;
  subject: string;
  description: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/** The org's permissions bucketed by subject — what role matrices render from. */
export interface IPermissionGroup {
  subject: string;
  permissions: IPermission[];
}

/** A catalog entry: platform-level, not yet tied to an organization. */
export interface ICatalogPermission {
  action: string;
  subject: string;
  description: string;
}

export interface IPermissionCatalog {
  total: number;
  permissions: ICatalogPermission[];
}

/**
 * What a default role grants. `'*'` at the top level means every permission
 * in the catalog; per subject, `'*'` means every action on that subject.
 */
export type RolePermissionMatrix = '*' | Record<string, string[] | '*'>;

export interface IDefaultRoleTemplate {
  name: string;
  description: string;
  permissions: RolePermissionMatrix;
}

export interface IDefaultRoleTemplates {
  total: number;
  roles: IDefaultRoleTemplate[];
}

export interface IRolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: IPermission;
}

export interface IRoleUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface IRole {
  id: string;
  name: string;
  description: string | null;
  /** Platform-managed roles: usable by the org but not editable or deletable. */
  isSystem: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  rolePermissions: IRolePermission[];
  /** Present on list responses. */
  _count?: { userRoles: number };
  /** Present on the single-role response. */
  userRoles?: Array<{ user: IRoleUser }>;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export type UpdateRolePayload = Partial<CreateRolePayload>;

/** `POST .../permissions/sync` — one org. */
export interface IPermissionSyncResult {
  organizationId: string;
  created: number;
  existed: number;
}

/** `POST /access/permissions/sync` — every org. */
export interface IPermissionSyncAllResult {
  organizations: number;
  created: number;
}

/** `POST .../roles/sync-defaults` — one org. */
export interface IRoleSeedResult {
  organizationId: string;
  roles: string[];
}

/** `POST /access/roles/sync-defaults` — every org. */
export interface IRoleSyncAllResult {
  organizations: number;
}
