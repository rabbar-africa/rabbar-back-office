import { Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { overviewStats } from '../data';

export function OverviewTemplate() {
  return (
    <Flex direction="column" gap="1.5rem">
      <Heading fontSize="1.5rem" fontWeight="600">
        Dashboard
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="1rem">
        {overviewStats.map((stat) => (
          <Box
            key={stat.id}
            bg="white"
            border="1px solid #EBEBEB"
            rounded="lg"
            p="1.25rem"
          >
            <Text fontSize=".875rem" color="gray.500">
              {stat.label}
            </Text>
            <Text fontSize="1.5rem" fontWeight="700" mt=".5rem">
              {stat.value}
            </Text>
            <Flex align="center" gap=".375rem" mt=".5rem">
              <Text
                fontSize=".8125rem"
                fontWeight="600"
                color={stat.trend === 'up' ? 'success.300' : 'error.300'}
              >
                {stat.trend === 'up' ? '▲' : '▼'} {stat.percentage}
              </Text>
              <Text fontSize=".8125rem" color="gray.400">
                {stat.helperText}
              </Text>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
