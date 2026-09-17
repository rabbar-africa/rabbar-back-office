import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type {
  CreatePromoCodePayload,
  IGetPromoCodesFilter,
  IPromoCode,
  IPromoCodeDetail,
  UpdatePromoCodePayload,
} from '@/shared/interface/promo-code';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

const BASE_PATH = 'back-office/promo-codes';

export const promoCodesService = {
  getAll: async (filter?: IGetPromoCodesFilter) => {
    const url = buildUrlWithQueryParams(BASE_PATH, filter);
    const response = await axios.get<ApiResponse<IPromoCode[]>>(url);
    return response.data;
  },

  /** One code with the organizations that used it. */
  getById: async (id: string) => {
    const response = await axios.get<ApiResponse<IPromoCodeDetail>>(
      `${BASE_PATH}/${id}`
    );
    return response.data;
  },

  create: async (payload: CreatePromoCodePayload) => {
    const response = await axios.post<ApiResponse<IPromoCode>>(
      BASE_PATH,
      payload
    );
    return response.data;
  },

  /** Edit or (de)activate. `code` and `type` are rejected by the API. */
  update: async ({
    id,
    payload,
  }: {
    id: string;
    payload: UpdatePromoCodePayload;
  }) => {
    const response = await axios.patch<ApiResponse<IPromoCode>>(
      `${BASE_PATH}/${id}`,
      payload
    );
    return response.data;
  },
};
