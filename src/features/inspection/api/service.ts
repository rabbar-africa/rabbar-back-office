import { axios } from '@/lib/axios';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';
import type { ApiResponse } from '@/shared/interface/api';
import type {
  IGetInspectionsFilter,
  IInspection,
  IInspectionListItem,
} from '@/shared/interface/inspection';

const BASE_PATH = 'back-office/inspections';

/** Inspections across every organization; pass `organizationId` to scope. */
export const getInspections = async (filter?: IGetInspectionsFilter) => {
  const apiUrl = buildUrlWithQueryParams(BASE_PATH, filter);
  const response = await axios.get<ApiResponse<IInspectionListItem[]>>(apiUrl);
  return response.data;
};

export const getInspectionById = async (id: string) => {
  const response = await axios.get<ApiResponse<IInspection>>(
    `${BASE_PATH}/${id}`
  );
  return response.data;
};
