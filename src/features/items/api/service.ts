import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type { CreateItemPayload } from '@/shared/interface/item';
import type { IBaseFilter } from '@/shared/interface/filter';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';
import type { ApiItem } from './types';

const BASE_PATH = 'back-office/items';

export const itemsService = {
  // List items across all orgs. Filter by org with { organizationId }.
  getAll: async (filter?: IBaseFilter) => {
    const url = buildUrlWithQueryParams(BASE_PATH, filter);
    const response = await axios.get<ApiResponse<ApiItem[]>>(url);
    return response.data;
  },

  // Create an item on behalf of a specific organization.
  createForOrganization: async ({
    orgId,
    payload,
  }: {
    orgId: string;
    payload: CreateItemPayload;
  }) => {
    const response = await axios.post<ApiResponse<ApiItem>>(
      `back-office/organizations/${orgId}/items`,
      payload
    );
    return response.data;
  },
};
