import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type { IOrganization } from '@/shared/interface/common';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';
import type {
  CreateOrganizationPayload,
  UpdateOrganizationPayload,
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
};
