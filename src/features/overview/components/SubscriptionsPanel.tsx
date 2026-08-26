import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import Status from '@/components/ui/Status';
import { pascalToCapitalized } from '@/utils/string-formatter';
import type { IOverviewSubscriptions } from '@/shared/interface/overview';
import { SectionCard } from './SectionCard';

interface SubscriptionsPanelProps {
  subscriptions: IOverviewSubscriptions;
}

export function SubscriptionsPanel({ subscriptions }: SubscriptionsPanelProps) {
  const byStatus = subscriptions.byStatus ?? [];
  const byPlan = subscriptions.byPlan ?? [];
  const totalSubs = byStatus.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <SectionCard
      title="Subscriptions"
      subtitle={`${totalSubs} subscription${totalSubs === 1 ? '' : 's'} across all organizations`}
    >
      {totalSubs === 0 ? (
        <Text textStyle="small-regular" color="gray.300" py="2">
          No subscriptions yet.
        </Text>
      ) : (
        <Stack gap="1.25rem">
          <Box>
            <Text textStyle="tiny-regular" color="gray.300" mb=".5rem">
              By status
            </Text>
            <Flex gap="2" wrap="wrap">
              {byStatus.map((entry) => (
                <Flex key={entry.status} align="center" gap=".375rem">
                  <Status
                    name={pascalToCapitalized(entry.status)}
                    px=".5rem"
                    w="auto"
                    minW="4.5rem"
                    h="1.75rem"
                    whiteSpace="nowrap"
                  />
                  <Text textStyle="small-semibold" color="gray.500">
                    {entry.count}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text textStyle="tiny-regular" color="gray.300" mb=".5rem">
              By plan
            </Text>
            <Stack gap=".5rem">
              {byPlan.map((entry) => {
                const share =
                  totalSubs > 0 ? (entry.count / totalSubs) * 100 : 0;
                return (
                  <Box key={`${entry.tier ?? 'unknown'}-${entry.name}`}>
                    <Flex justify="space-between" align="center" mb=".25rem">
                      <Text textStyle="small-regular" color="gray.400">
                        {entry.name}
                      </Text>
                      <Text textStyle="small-semibold" color="gray.500">
                        {entry.count}
                      </Text>
                    </Flex>
                    <Box bg="gray.50" h="6px" rounded="full" overflow="hidden">
                      <Box
                        bg="primary.300"
                        h="100%"
                        w={`${share}%`}
                        rounded="full"
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      )}
    </SectionCard>
  );
}
