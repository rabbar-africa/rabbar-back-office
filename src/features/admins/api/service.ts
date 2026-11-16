import { axios } from '@/lib/axios';
import type {
  CreateAdminPayload,
  IAccessLogFilter,
  IAccessLogPage,
  IAdmin,
  IAdminInviteInfo,
  IAdminPermissions,
} from '@/shared/interface/admin';
import type { LoginResponse } from '@/features/auth/api/types';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

const ADMINS = 'back-office/admins';

export const adminsService = {
  /** What the signed-in admin may do (only owners manage admins). */
  getMe: async () => {
    const response = await axios.get<{ data: IAdminPermissions }>(
      `${ADMINS}/me`
    );
    return response.data.data;
  },

  getAll: async () => {
    const response = await axios.get<{ data: IAdmin[] }>(ADMINS);
    return response.data.data;
  },

  /** Owners only. Emails them an invite link; no password is set. */
  create: async (payload: CreateAdminPayload) => {
    const response = await axios.post<{ data: IAdmin }>(ADMINS, payload);
    return response.data.data;
  },

  /** Owners only. Deactivating ends the admin's sessions at once. */
  setActive: async ({ id, isActive }: { id: string; isActive: boolean }) => {
    const response = await axios.patch<{ data: IAdmin }>(
      `${ADMINS}/${id}/status`,
      { isActive }
    );
    return response.data.data;
  },

  /**
   * Owners only. A new invite link (the old one stops working). For an admin
   * who has already joined, this is how their password is reset.
   */
  resendInvite: async (id: string) => {
    const response = await axios.post<{ data: { expiresAt: string } }>(
      `${ADMINS}/${id}/invite`
    );
    return response.data.data;
  },

  /** Owners only. Stops a pending invite link. */
  cancelInvite: async (id: string) => {
    await axios.delete(`${ADMINS}/${id}/invite`);
  },

  /** Public: who the invite is for. 404 used/replaced, 410 expired. */
  getInvite: async (token: string) => {
    const response = await axios.get<{ data: IAdminInviteInfo }>(
      `${ADMINS}/invites/${encodeURIComponent(token)}`
    );
    return response.data.data;
  },

  /** Public: choose a password; signs them in. */
  acceptInvite: async ({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) => {
    const response = await axios.post<{ data: LoginResponse }>(
      `${ADMINS}/invites/${encodeURIComponent(token)}/accept`,
      { password }
    );
    return response.data.data;
  },

  /** Owners only. Newest first, cursor-paged. */
  getAccessLog: async (filter: IAccessLogFilter) => {
    const url = buildUrlWithQueryParams('back-office/access-log', filter);
    const response = await axios.get<{ data: IAccessLogPage }>(url);
    return response.data.data;
  },
};
