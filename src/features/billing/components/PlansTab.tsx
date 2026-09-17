import { useState } from 'react';
import { Box, Button, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import Status from '@/components/common/Status';
import SectionLoader from '@/components/common/SectionLoader';
import type { IPlan } from '@/features/organizations/api/types';
import { useGetPlans } from '@/features/organizations/api/query';
import { formatAmount } from '@/utils/format-number';
import { isFreePlan } from '../data';
import { PlanFormModal } from './PlanFormModal';

/** The plan catalog: three fixed tiers whose names and prices can change. */
export function PlansTab() {
  const { data, isPending } = useGetPlans();
  const plans = data?.data ?? [];
  const [editing, setEditing] = useState<IPlan | null>(null);

  if (isPending) return <SectionLoader />;

  return (
    <>
      <Box mb="1rem">
        <Text
          textStyle={{ base: 'default-bold', md: 'large-bold' }}
          color="gray.500"
        >
          Plans
        </Text>
        <Text textStyle="small-regular" color="gray.300">
          What organizations pay each month. Promo codes are applied on top of
          these prices.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="1.25rem">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onEdit={() => setEditing(plan)} />
        ))}
      </SimpleGrid>

      <PlanFormModal plan={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function PlanCard({ plan, onEdit }: { plan: IPlan; onEdit: () => void }) {
  const free = isFreePlan(plan);
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
      opacity={plan.isActive ? 1 : 0.7}
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
        <Status name={plan.isActive ? 'Active' : 'Inactive'} />
      </Flex>

      <Box>
        <Text
          fontSize="1.5rem"
          fontWeight="700"
          color="gray.500"
          lineHeight="1.2"
        >
          {free
            ? 'Free'
            : formatAmount(Number(plan.monthlyPrice), plan.currency)}
        </Text>
        <Text textStyle="tiny-regular" color="gray.300">
          {free ? 'Default plan for every new organization' : 'per month'}
        </Text>
      </Box>

      <Text textStyle="small-regular" color="gray.400" flex="1">
        {plan.description || 'No description yet.'}
      </Text>

      <Button
        size="sm"
        variant="outline"
        alignSelf="flex-start"
        onClick={onEdit}
      >
        Edit plan
      </Button>
    </Box>
  );
}
