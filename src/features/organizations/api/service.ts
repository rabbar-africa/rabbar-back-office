import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type { IOrganization } from '@/shared/interface/common';
import type { IInvoiceResponse } from '@/shared/interface/invoice';
import type { IPaymentReceived } from '@/shared/interface/payment';
import type {
  IOrgAddress,
  IOrgBankAccount,
  CreateOrgAddressPayload,
  UpdateOrgAddressPayload,
  CreateOrgBankAccountPayload,
  IOrgTransactionSeries,
  UpsertOrgTransactionSeriesPayload,
  TxnSeriesModule,
} from '@/shared/interface/settings';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';
import type {
  CreateOrganizationPayload,
  UpdateOrganizationPayload,
  UpdateOrgBankAccountPayload,
  IGetOrganizationsFilter,
  IOrgRecordsFilter,
  IPlan,
  IOrganizationSubscription,
  CreateManualPaymentPayload,
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

export const organizationTransactionSeriesService = {
  getAll: async (id: string) => {
    const response = await axios.get<ApiResponse<IOrgTransactionSeries[]>>(
      `${BASE_PATH}/${id}/transaction-series`
    );
    return response.data;
  },

  upsert: async ({
    id,
    module,
    payload,
  }: {
    id: string;
    module: TxnSeriesModule;
    payload: UpsertOrgTransactionSeriesPayload;
  }) => {
    const response = await axios.put<ApiResponse<IOrgTransactionSeries>>(
      `${BASE_PATH}/${id}/transaction-series/${module}`,
      payload
    );
    return response.data;
  },

  remove: async ({ id, module }: { id: string; module: TxnSeriesModule }) => {
    const response = await axios.delete<ApiResponse<null>>(
      `${BASE_PATH}/${id}/transaction-series/${module}`
    );
    return response.data;
  },
};

export const organizationsSubscriptionService = {
  getSubscription: async (id: string) => {
    const response = await axios.get<ApiResponse<IOrganizationSubscription>>(
      `back-office/subscriptions/${id}`
    );
    return response.data;
  },

  getPlans: async () => {
    const response = await axios.get<ApiResponse<IPlan[]>>('back-office/plans');
    return response.data;
  },

  cancelSubscription: async (id: string) => {
    const response = await axios.post<ApiResponse<IOrganizationSubscription>>(
      `back-office/subscriptions/${id}/cancel`
    );
    return response.data;
  },

  createManualSubscription: async (data: {
    id: string;
    payload: CreateManualPaymentPayload;
  }) => {
    const response = await axios.post<ApiResponse<IOrganizationSubscription>>(
      `back-office/subscriptions/${data.id}/payments`,
      data.payload
    );
    return response.data;
  },

  reactivateCancelledSubscription: async (id: string) => {
    const response = await axios.patch<ApiResponse<IOrganizationSubscription>>(
      `back-office/subscriptions/${id}/reactivate`
    );
    return response.data;
  },
};

/**
 * One organization's records, read through the back office's cross-tenant
 * endpoints.
 *
 * These must NOT go through the tenant-facing feature services (`/invoices`,
 * `/payments-received`, …): those take the organization from the caller's JWT
 * and ignore an `organizationId` query param entirely, so a platform admin —
 * who has no organizationId — gets every organization's records back
 * unfiltered. Only the `back-office/*` endpoints accept the organization
 * explicitly.
 *
 * Responses are list projections: a subset of each record's columns plus the
 * owning `organization`. Enough for the detail tabs; fetch the record itself
 * for anything more.
 */
export const organizationRecordsService = {
  getInvoices: async (id: string, filter?: IOrgRecordsFilter) => {
    const url = buildUrlWithQueryParams('back-office/invoices', {
      ...filter,
      organizationId: id,
    });
    const response = await axios.get<ApiResponse<IInvoiceResponse[]>>(url);
    return response.data;
  },

  getPaymentsReceived: async (id: string, filter?: IOrgRecordsFilter) => {
    const url = buildUrlWithQueryParams('back-office/payments-received', {
      ...filter,
      organizationId: id,
    });
    const response = await axios.get<ApiResponse<IPaymentReceived[]>>(url);
    return response.data;
  },
};
