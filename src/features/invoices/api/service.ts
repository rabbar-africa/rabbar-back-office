import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type {
  IInvoiceResponse,
  IGetInvoiceFilter,
} from '@/shared/interface/invoice';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

const BASE_PATH = 'back-office/invoices';

export const invoicesService = {
  // List invoices across all orgs. Filter by org with { organizationId }.
  getAll: async (filter?: IGetInvoiceFilter) => {
    const url = buildUrlWithQueryParams(BASE_PATH, filter);
    const response = await axios.get<ApiResponse<IInvoiceResponse[]>>(url);
    return response.data;
  },
};
