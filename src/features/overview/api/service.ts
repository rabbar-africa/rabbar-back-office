import { axios } from '@/lib/axios';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';
import type { ApiResponse } from '@/shared/interface/api';
import type {
  IOverviewFilter,
  IOverviewResponse,
} from '@/shared/interface/overview';

const BASE_PATH = 'back-office/analytics';

/** Platform-wide dashboard figures for the back office. */
export const getOverview = async (filter?: IOverviewFilter) => {
  const apiUrl = buildUrlWithQueryParams(BASE_PATH, filter);
  const response = await axios.get<ApiResponse<IOverviewResponse>>(apiUrl);
  return response.data;
};
