import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type { Item, CreateItemPayload } from '@/shared/interface/item';
import type { IBaseFilter } from '@/shared/interface/filter';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

const BASE_PATH = 'back-office/items';

export const itemsService = {
  // List items across all orgs. Filter by org with { organizationId }.
  getAll: async (filter?: IBaseFilter) => {
    const url = buildUrlWithQueryParams(BASE_PATH, filter);
    const response = await axios.get<ApiResponse<Item[]>>(url);
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
    const response = await axios.post<ApiResponse<Item>>(
      `back-office/organizations/${orgId}/items`,
      payload
    );
    return response.data;
  },
};
