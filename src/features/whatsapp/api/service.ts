import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type {
  IGetWhatsappActivityFilter,
  IGetWhatsappConversationFilter,
  IGetWhatsappPeopleFilter,
  IWhatsappConversation,
  IWhatsappEvent,
  IGetWhatsappUsageFilter,
  IWhatsappPeople,
  IWhatsappUsage,
} from '@/shared/interface/whatsapp';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

const BASE_PATH = 'back-office/whatsapp';

export const whatsappService = {
  /** Aggregate numbers for the period (defaults to the last 30 days). */
  getUsage: async (filter?: IGetWhatsappUsageFilter) => {
    const url = buildUrlWithQueryParams(
      'back-office/analytics/whatsapp',
      filter
    );
    const response = await axios.get<ApiResponse<IWhatsappUsage>>(url);
    return response.data;
  },

  /** The activity feed, newest first. */
  getActivity: async (filter?: IGetWhatsappActivityFilter) => {
    const url = buildUrlWithQueryParams(`${BASE_PATH}/activity`, filter);
    const response = await axios.get<ApiResponse<IWhatsappEvent[]>>(url);
    return response.data;
  },

  /** One number's conversation with the bot, oldest first. */
  getConversation: async (
    phone: string,
    filter?: IGetWhatsappConversationFilter
  ) => {
    const url = buildUrlWithQueryParams(
      `${BASE_PATH}/conversations/${encodeURIComponent(phone)}`,
      filter
    );
    const response = await axios.get<ApiResponse<IWhatsappConversation>>(url);
    return response.data;
  },

  /** Everyone who messaged the bot in the period (defaults to the last 30 days). */
  getPeople: async (filter?: IGetWhatsappPeopleFilter) => {
    const url = buildUrlWithQueryParams(`${BASE_PATH}/people`, filter);
    const response = await axios.get<ApiResponse<IWhatsappPeople>>(url);
    return response.data;
  },
};
