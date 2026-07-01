import { Box, Button, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import Status from '@/components/common/Status';
import { formatAmount } from '@/utils/format-number';

interface OrgSubscriptionTabProps {
  plan?: string;
  onCancel: () => void;
}

// Dummy subscription snapshot until the billing API is wired up.
const subscription = {
  status: 'active',
  amount: 250000,
  interval: 'Yearly',
  seats: 50,
  startedAt: '12 Jan, 2025',
  renewsAt: '12 Jan, 2026',
};

export function OrgSubscriptionTab({
  plan,
  onCancel,
}: OrgSubscriptionTabProps) {
  const rows = [
    { label: 'Plan', value: plan || 'Enterprise' },
    { label: 'Billing interval', value: subscription.interval },
    { label: 'Amount', value: formatAmount(subscription.amount) },
    { label: 'Seats', value: String(subscription.seats) },
    { label: 'Started', value: subscription.startedAt },
    { label: 'Renews', value: subscription.renewsAt },
  ];

  return (
    <Box
      bg="white"
      border="1px solid #EBEBEB"
      rounded="lg"
      p="1.5rem"
      maxW="42rem"
    >
      <Flex justify="space-between" align="center" mb="1.5rem">
        <Text fontSize="1.125rem" fontWeight="600">
          Subscription
        </Text>
        <Status name={subscription.status} />
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1.25rem">
        {rows.map((row) => (
          <Box key={row.label}>
            <Text fontSize=".8125rem" color="gray.500">
              {row.label}
            </Text>
            <Text fontSize=".9375rem" fontWeight="500" mt=".25rem">
              {row.value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <Flex justify="flex-end" mt="2rem">
        <Button
          variant="outline"
          color="error.300"
          borderColor="error.300"
          _hover={{ bg: 'error.50' }}
          onClick={onCancel}
        >
          Cancel Subscription
        </Button>
      </Flex>
    </Box>
  );
}
