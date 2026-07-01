import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type { IOrganization } from '@/shared/interface/common';
import type {
  IOrgAddress,
  IOrgBankAccount,
  CreateOrgAddressPayload,
  UpdateOrgAddressPayload,
  CreateOrgBankAccountPayload,
} from '@/shared/interface/settings';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';
import type {
  CreateOrganizationPayload,
  UpdateOrganizationPayload,
  UpdateOrgBankAccountPayload,
  IGetOrganizationsFilter,
} from './types';

const BASE_PATH = 'back-office/organizations';

export const organizationsService = {
  getAll: async (filter?: IGetOrganizationsFilter) => {
    const url = buildUrlWithQueryParams(BASE_PATH, filter);
    const response = await axios.get<ApiResponse<IOrganization[]>>(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get<ApiResponse<IOrganization>>(
      `${BASE_PATH}/${id}`
    );
    return response.data;
  },

  create: async (payload: CreateOrganizationPayload) => {
    const response = await axios.post<ApiResponse<IOrganization>>(
      BASE_PATH,
      payload
    );
    return response.data;
  },

  update: async ({
    id,
    ...payload
  }: UpdateOrganizationPayload & { id: string }) => {
    const response = await axios.patch<ApiResponse<IOrganization>>(
      `${BASE_PATH}/${id}`,
      payload
    );
    return response.data;
  },

  remove: async (id: string) => {
    const response = await axios.delete<ApiResponse<null>>(
      `${BASE_PATH}/${id}`
    );
    return response.data;
  },

  activate: async (id: string) => {
    const response = await axios.patch<ApiResponse<IOrganization>>(
      `${BASE_PATH}/${id}/activate`
    );
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await axios.patch<ApiResponse<IOrganization>>(
      `${BASE_PATH}/${id}/deactivate`
    );
    return response.data;
  },

  updateLogo: async ({ id, file }: { id: string; file: File }) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axios.patch<ApiResponse<IOrganization>>(
      `${BASE_PATH}/${id}/logo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  seedDefaults: async (id: string) => {
    const response = await axios.post<ApiResponse<IOrganization>>(
      `${BASE_PATH}/${id}/seed-defaults`
    );
    return response.data;
  },
};

export const organizationAddressService = {
  getAll: async (id: string) => {
    const response = await axios.get<ApiResponse<IOrgAddress[]>>(
      `${BASE_PATH}/${id}/addresses`
    );
    return response.data;
  },

  create: async ({
    id,
    payload,
  }: {
    id: string;
    payload: CreateOrgAddressPayload;
  }) => {
    const response = await axios.post<ApiResponse<IOrgAddress>>(
      `${BASE_PATH}/${id}/addresses`,
      payload
    );
    return response.data;
  },

  update: async ({
    id,
    addressId,
    payload,
  }: {
    id: string;
    addressId: string;
    payload: UpdateOrgAddressPayload;
  }) => {
    const response = await axios.patch<ApiResponse<IOrgAddress>>(
      `${BASE_PATH}/${id}/addresses/${addressId}`,
      payload
    );
    return response.data;
  },

  remove: async ({ id, addressId }: { id: string; addressId: string }) => {
    const response = await axios.delete<ApiResponse<null>>(
      `${BASE_PATH}/${id}/addresses/${addressId}`
    );
    return response.data;
  },

  setPrimary: async ({ id, addressId }: { id: string; addressId: string }) => {
    const response = await axios.patch<ApiResponse<IOrgAddress>>(
      `${BASE_PATH}/${id}/addresses/${addressId}/primary`
    );
    return response.data;
  },
};

export const organizationBankAccountService = {
  getAll: async (id: string) => {
    const response = await axios.get<ApiResponse<IOrgBankAccount[]>>(
      `${BASE_PATH}/${id}/bank-accounts`
    );
    return response.data;
  },

  create: async ({
    id,
    payload,
  }: {
    id: string;
    payload: CreateOrgBankAccountPayload;
  }) => {
    const response = await axios.post<ApiResponse<IOrgBankAccount>>(
      `${BASE_PATH}/${id}/bank-accounts`,
      payload
    );
    return response.data;
  },

  update: async ({
    id,
    accountId,
    payload,
  }: {
    id: string;
    accountId: string;
    payload: UpdateOrgBankAccountPayload;
  }) => {
    const response = await axios.patch<ApiResponse<IOrgBankAccount>>(
      `${BASE_PATH}/${id}/bank-accounts/${accountId}`,
      payload
    );
    return response.data;
  },

  remove: async ({ id, accountId }: { id: string; accountId: string }) => {
    const response = await axios.delete<ApiResponse<null>>(
      `${BASE_PATH}/${id}/bank-accounts/${accountId}`
    );
    return response.data;
  },

  setPrimary: async ({ id, accountId }: { id: string; accountId: string }) => {
    const response = await axios.patch<ApiResponse<IOrgBankAccount>>(
      `${BASE_PATH}/${id}/bank-accounts/${accountId}/primary`
    );
    return response.data;
  },
};

export const organizationsSubscriptionService = {
  getSubscription: async (id: string) => {
    const response = await axios.get<ApiResponse<any>>(
      `/back-office/subscriptions/${id}`
    );
    return response.data;
  },

  cancelSubscription: async (id: string) => {
    const response = await axios.post<ApiResponse<any>>(
      `/api/v1/back-office/subscriptions/${id}/cancel`
    );
    return response.data;
  },

  createManualSubscription: async (data: {
    id: string;
    payload: {
      planTier: string;
      amount: number;
      currency: string;
      periodStart: string;
      periodMonths: number;
      paidAt: string;
      method: string;
      reference: string;
      note: string;
    };
  }) => {
    const response = await axios.post<ApiResponse<any>>(
      `/api/v1/back-office/subscriptions/${data.id}/payments`,
      data.payload
    );
    return response.data;
  },

  reactivateCancelledSubscription: async ({ id }) => {
    const response = await axios.patch<ApiResponse<any>>(
      `/api/v1/back-office/subscriptions/${id}/reactivate`
    );
    return response.data;
  },
};
