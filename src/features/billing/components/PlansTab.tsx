import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Status from '@/components/common/Status';
import SectionLoader from '@/components/common/SectionLoader';
import type { IPlan } from '@/features/organizations/api/types';
import { useGetPlans } from '@/features/organizations/api/query';
import { isContactSalesTier } from '@/shared/constants/subscription';
import type { IPlanCatalog } from '@/shared/interface/plan-entitlements';
import { formatAmount } from '@/utils/format-number';
import { isFreePlan } from '../data';
import { useGetPlanCatalog } from '../api';
import { PlanFormModal } from './PlanFormModal';
import { PlanEntitlementsModal } from './PlanEntitlementsModal';
import { differences, fromRows } from './entitlements/draft';
import { RefreshButton } from '@/components/common/RefreshButton';
import { customQueryKey } from '@/shared/constants/query-keys';

/**
 * The plan catalog: fixed tiers whose names, prices and what each includes
 * can change here, without a deploy.
 */
export function PlansTab() {
  const { data, isPending } = useGetPlans();
  const plans = data?.data ?? [];
  const { data: catalogData } = useGetPlanCatalog();
  const [editing, setEditing] = useState<IPlan | null>(null);
  const [editingIncludes, setEditingIncludes] = useState<IPlan | null>(null);

  if (isPending) return <SectionLoader />;

  return (
    <>
      <Flex justify="space-between" align="flex-start" gap="3" mb="1rem">
        <Box>
          <Text
            textStyle={{ base: 'default-bold', md: 'large-bold' }}
            color="gray.500"
          >
            Plans
          </Text>
          <Text textStyle="small-regular" color="gray.300">
            What organizations pay each month and what each plan includes. Promo
            codes are applied on top of these prices.
          </Text>
        </Box>
        <RefreshButton
          queryKeys={[[customQueryKey.plans.getAll]]}
          label="Reload plans"
        />
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="1.25rem">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            catalog={catalogData?.data}
            onEdit={() => setEditing(plan)}
            onEditIncludes={() => setEditingIncludes(plan)}
          />
        ))}
      </SimpleGrid>

      <PlanFormModal plan={editing} onClose={() => setEditing(null)} />
      <PlanEntitlementsModal
        plan={editingIncludes}
        onClose={() => setEditingIncludes(null)}
      />
    </>
  );
}

function PlanCard({
  plan,
  catalog,
  onEdit,
  onEditIncludes,
}: {
  plan: IPlan;
  catalog?: IPlanCatalog;
  onEdit: () => void;
  onEditIncludes: () => void;
}) {
  const free = isFreePlan(plan);
  const contactSales = plan.contactSales ?? isContactSalesTier(plan.tier);
  const limits = (plan.limits ?? []).filter((row) => !row.comingSoon);
  const features = (plan.features ?? []).filter((row) => !row.comingSoon);
  const defaults = catalog?.defaults[plan.tier];
  const changed =
    plan.features && plan.limits && defaults
      ? differences(
          fromRows({ features: plan.features, limits: plan.limits }),
          defaults
        ).count
      : 0;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      shadow="sm"
      p="1.5rem"
      display="flex"
      flexDirection="column"
      gap="1rem"
      opacity={plan.isActive || contactSales ? 1 : 0.7}
    >
      <Flex justify="space-between" align="flex-start" gap="1rem">
        <Box>
          <Text fontSize="1.125rem" fontWeight="600" color="gray.500">
            {plan.name}
          </Text>
          <Text fontSize="11px" color="gray.300" letterSpacing="0.3px">
            {plan.tier}
          </Text>
        </Box>
        <Status
          name={
            contactSales ? 'Talk to us' : plan.isActive ? 'Active' : 'Inactive'
          }
        />
      </Flex>

      <Box>
        <Text
          fontSize="1.5rem"
          fontWeight="700"
          color="gray.500"
          lineHeight="1.2"
        >
          {contactSales
            ? 'Talk to us'
            : free
              ? 'Free'
              : formatAmount(Number(plan.monthlyPrice), plan.currency)}
        </Text>
        <Text textStyle="tiny-regular" color="gray.300">
          {contactSales
            ? 'Never at checkout. Put a business on it from its Subscription tab, then set its terms there.'
            : free
              ? 'Default plan for every new organization'
              : 'per month'}
        </Text>
      </Box>

      <Text textStyle="small-regular" color="gray.400">
        {plan.description || 'No description yet.'}
      </Text>

      {limits.length > 0 && (
        <Stack gap=".25rem" flex="1">
          <Flex align="center" gap=".5rem">
            <Text textStyle="tiny-semibold" color="gray.300">
              INCLUDES
            </Text>
            {changed > 0 && (
              <Badge size="xs" variant="subtle" colorPalette="orange">
                {changed} changed from default
              </Badge>
            )}
          </Flex>
          {limits.map((row) => (
            <Text key={row.key} textStyle="tiny-regular" color="gray.500">
              {row.phrase}
            </Text>
          ))}
          <Text textStyle="tiny-regular" color="gray.400">
            {features.filter((row) => row.included).length} of {features.length}{' '}
            features on
          </Text>
        </Stack>
      )}

      <Flex gap=".5rem" wrap="wrap" mt="auto">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit plan
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onEditIncludes}
          disabled={!plan.features || !plan.limits}
        >
          Edit what's included
        </Button>
      </Flex>
    </Box>
  );
}
