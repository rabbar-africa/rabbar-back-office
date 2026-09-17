import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MutationConfig, QueryConfigType } from '@/lib/react-query';
import { toaster } from '@/components/ui';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IGetPromoCodesFilter } from '@/shared/interface/promo-code';
import { promoCodesService } from './service';

export function useGetPromoCodes(
  filter?: IGetPromoCodesFilter,
  config?: QueryConfigType<typeof promoCodesService.getAll>
) {
  return useQuery({
    queryKey: [customQueryKey.promoCodes.getAll, filter],
    queryFn: () => promoCodesService.getAll(filter),
    ...config,
  });
}

export function useGetPromoCodeById(
  id: string,
  config?: QueryConfigType<typeof promoCodesService.getById>
) {
  return useQuery({
    queryKey: [customQueryKey.promoCodes.getById, id],
    queryFn: () => promoCodesService.getById(id),
    enabled: !!id,
    ...config,
  });
}

/**
 * Saving one code can switch auto-apply off on every other code, so refresh
 * the whole list and any open detail rather than just the edited row.
 */
function useInvalidatePromoCodes() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.promoCodes.getAll],
    });
    queryClient.invalidateQueries({
      queryKey: [customQueryKey.promoCodes.getById],
    });
  };
}

export function useCreatePromoCode(
  config?: MutationConfig<typeof promoCodesService.create>
) {
  const invalidate = useInvalidatePromoCodes();
  return useMutation({
    mutationFn: promoCodesService.create,
    meta: { successMessage: 'Promo code created' },
    onSuccess: invalidate,
    ...config,
  });
}

export function useUpdatePromoCode(
  config?: MutationConfig<typeof promoCodesService.update>
) {
  const invalidate = useInvalidatePromoCodes();
  return useMutation({
    mutationFn: promoCodesService.update,
    meta: { successMessage: 'Promo code saved' },
    onSuccess: invalidate,
    ...config,
  });
}

/** Quick activate/deactivate from the list or detail header. */
export function useSetPromoCodeActive() {
  const invalidate = useInvalidatePromoCodes();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promoCodesService.update({ id, payload: { isActive } }),
    onSuccess: (_data, { isActive }) => {
      invalidate();
      toaster.create({
        description: isActive
          ? 'Promo code activated'
          : 'Promo code deactivated',
        type: 'success',
      });
    },
  });
}
