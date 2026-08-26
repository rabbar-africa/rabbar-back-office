import { axios } from '@/lib/axios';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';
import type { ApiResponse } from '@/shared/interface/api';
import type {
  IGetJobCardsFilter,
  IJobCardListItem,
} from '@/shared/interface/job-card';

const BASE_PATH = 'back-office/job-cards';

/** Job cards across every organization; pass `organizationId` to scope. */
export const getJobCards = async (filter?: IGetJobCardsFilter) => {
  const apiUrl = buildUrlWithQueryParams(BASE_PATH, filter);
  const response = await axios.get<ApiResponse<IJobCardListItem[]>>(apiUrl);
  return response.data;
};
