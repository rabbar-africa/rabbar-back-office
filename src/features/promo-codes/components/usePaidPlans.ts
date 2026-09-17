import { useMemo } from 'react';
import { useGetPlans } from '@/features/organizations/api/query';
import type { PlanNames } from '../data';

/**
 * The plan catalog for promo code forms and summaries. Starter is free, so it
 * is never offered as a promo plan — but its name is still kept for labels.
 */
export function usePaidPlans(enabled = true) {
  const { data, isPending } = useGetPlans({ enabled });
  const all = data?.data;

  const plans = useMemo(
    () => (all ?? []).filter((plan) => plan.tier !== 'STARTER'),
    [all]
  );
  const planNames = useMemo<PlanNames>(
    () => Object.fromEntries((all ?? []).map((plan) => [plan.tier, plan.name])),
    [all]
  );

  return { plans, planNames, isLoading: enabled && isPending };
}
