import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type { ICustomer } from '@/shared/interface/customer';
import type { IBaseFilter } from '@/shared/interface/filter';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

const BASE_PATH = 'back-office/clients';

export const customersService = {
  // List customers across all orgs. Filter by org with { organizationId }.
  getAll: async (filter?: IBaseFilter) => {
    const url = buildUrlWithQueryParams(BASE_PATH, filter);
    const response = await axios.get<ApiResponse<ICustomer[]>>(url);
    return response.data;
  },
};
