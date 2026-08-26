import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';
import { pascalToCapitalized } from '@/utils/string-formatter';
import type { IOverviewTopActiveOrg } from '@/shared/interface/overview';
import { SectionCard } from './SectionCard';

interface TopActiveOrgsProps {
  orgs: IOverviewTopActiveOrg[];
}

/** Ordered breakdown entries, biggest contributor first. */
const breakdownEntries = (breakdown: Record<string, number>) =>
  Object.entries(breakdown ?? {}).sort((a, b) => b[1] - a[1]);

export function TopActiveOrgs({ orgs }: TopActiveOrgsProps) {
  const busiest = orgs[0]?.activityCount ?? 0;

  return (
    <SectionCard
      title="Most active organizations"
      subtitle="Records created in the selected period"
    >
      {orgs.length === 0 ? (
        <Text textStyle="small-regular" color="gray.300" py="2">
          No organization activity in this period.
        </Text>
      ) : (
        <Stack gap="1rem">
          {orgs.map((org, index) => (
            <Box key={org.id}>
              <Flex justify="space-between" align="center" gap="3" mb=".375rem">
                <Flex align="center" gap=".625rem" minW={0}>
                  <Flex
                    boxSize="1.5rem"
                    rounded="full"
                    bg="primary.50"
                    color="primary.300"
                    align="center"
                    justify="center"
                    fontSize=".6875rem"
                    fontWeight="700"
                    flexShrink={0}
                  >
                    {index + 1}
                  </Flex>
                  <Link
                    to={RouteConstants.organizations.detail.generate({
                      id: org.id,
                    })}
                  >
                    <Text
                      textStyle="small-semibold"
                      color="primary.300"
                      truncate
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {org.name}
                    </Text>
                  </Link>
                </Flex>
                <Text
                  textStyle="small-semibold"
                  color="gray.500"
                  flexShrink={0}
                >
                  {org.activityCount.toLocaleString()}
                </Text>
              </Flex>

              <Box bg="gray.50" h="6px" rounded="full" overflow="hidden">
                <Box
                  bg="primary.300"
                  h="100%"
                  w={`${busiest > 0 ? (org.activityCount / busiest) * 100 : 0}%`}
                  rounded="full"
                />
              </Box>

              <Flex gap="1" wrap="wrap" mt=".375rem">
                {breakdownEntries(org.breakdown).map(([table, count]) => (
                  <Text
                    key={table}
                    textStyle="tiny-regular"
                    color="gray.300"
                    bg="gray.50"
                    px=".375rem"
                    py=".125rem"
                    rounded="sm"
                  >
                    {pascalToCapitalized(table)}: {count}
                  </Text>
                ))}
              </Flex>
            </Box>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
