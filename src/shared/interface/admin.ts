/** A platform admin, from GET /back-office/admins. */
export interface IAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  isActive: boolean;
  isPlatformAdmin: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  /** Set while an invite link is out and not yet accepted. */
  pendingInvite?: { expiresAt: string } | null;
}

/** GET /back-office/admins/invites/:token (public). */
export interface IAdminInviteInfo {
  email: string;
  firstName: string;
  expiresAt: string;
}

/** GET /back-office/admins/me: what the signed-in admin may do. */
export interface IAdminPermissions {
  /** Owners only: add and deactivate admins, read the access log. */
  canManageAdmins: boolean;
}

/**
 * POST /back-office/admins. No password: the API emails a link (48 hours,
 * single use) where they choose their own.
 */
export interface CreateAdminPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

/** GET/POST/… for a request, or SIGN_IN / SIGN_IN_FAILED for the sign-in. */
export type AccessLogMethod = string;

/** One row of GET /back-office/access-log. */
export interface IAccessLogEntry {
  id: string;
  occurredAt: string;
  adminUserId: string;
  adminEmail: string;
  method: AccessLogMethod;
  /** The route's pattern, e.g. /api/v1/back-office/organizations/:id */
  route: string;
  /** As requested, ids filled in. */
  path: string;
  /** The business the request looked at, when the route names one. */
  organizationId: string | null;
  params: Record<string, string> | null;
  query: Record<string, unknown> | null;
  statusCode: number | null;
  ip: string | null;
  userAgent: string | null;
}

export interface IAccessLogFilter {
  adminUserId?: string;
  organizationId?: string;
  /** YYYY-MM-DD, Lagos days, inclusive. */
  from?: string;
  to?: string;
  cursor?: string;
  /** ≤ 200; the API defaults to 50. */
  limit?: number;
}

export interface IAccessLogPage {
  entries: IAccessLogEntry[];
  /** Pass as `cursor` for the next (older) page; null at the end. */
  nextCursor: string | null;
}
