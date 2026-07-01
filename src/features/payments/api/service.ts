import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type {
  IPaymentReceived,
  IGetPaymentsReceivedFilter,
} from '@/shared/interface/payment';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

const BASE_PATH = 'back-office/payments-received';

export const paymentsService = {
  // List payments received across all orgs. Filter by org with { organizationId }.
  getAll: async (filter?: IGetPaymentsReceivedFilter) => {
    const url = buildUrlWithQueryParams(BASE_PATH, filter);
    const response = await axios.get<ApiResponse<IPaymentReceived[]>>(url);
    return response.data;
  },
};
