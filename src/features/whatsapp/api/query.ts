import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type {
  IGetWhatsappActivityFilter,
  IGetWhatsappPeopleFilter,
  IGetWhatsappUsageFilter,
} from '@/shared/interface/whatsapp';
import { whatsappService } from './service';

export function useGetWhatsappActivity(
  filter?: IGetWhatsappActivityFilter,
  config?: QueryConfigType<typeof whatsappService.getActivity>
) {
  return useQuery({
    queryKey: [customQueryKey.whatsapp.activity, filter],
    queryFn: () => whatsappService.getActivity(filter),
    ...config,
  });
}

export function useGetWhatsappUsage(
  filter?: IGetWhatsappUsageFilter,
  config?: QueryConfigType<typeof whatsappService.getUsage>
) {
  return useQuery({
    queryKey: [customQueryKey.whatsapp.usage, filter],
    queryFn: () => whatsappService.getUsage(filter),
    ...config,
  });
}

export function useGetWhatsappPeople(
  filter?: IGetWhatsappPeopleFilter,
  config?: QueryConfigType<typeof whatsappService.getPeople>
) {
  return useQuery({
    queryKey: [customQueryKey.whatsapp.people, filter],
    queryFn: () => whatsappService.getPeople(filter),
    ...config,
  });
}

const CONVERSATION_PAGE_SIZE = 50;

/**
 * One number's chat. The first page is the most recent messages; each further
 * page is older, fetched with `before` = the oldest timestamp seen so far.
 */
export function useGetWhatsappConversation(phone: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: [customQueryKey.whatsapp.conversation, phone],
    queryFn: ({ pageParam }) =>
      whatsappService.getConversation(phone, {
        limit: CONVERSATION_PAGE_SIZE,
        before: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data.hasMore && lastPage.data.oldest
        ? lastPage.data.oldest
        : undefined,
    enabled: enabled && Boolean(phone),
    // Chats move; don't serve a five-minute-old transcript.
    staleTime: 30_000,
  });
}
