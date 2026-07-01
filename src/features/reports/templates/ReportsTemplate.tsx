import { Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { reportsData } from '../data';

export function ReportsTemplate() {
  return (
    <Flex direction="column" gap="1.5rem">
      <Heading fontSize="1.5rem" fontWeight="600">
        Reports
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="1rem">
        {reportsData.map((report) => (
          <Box
            key={report.id}
            bg="white"
            border="1px solid #EBEBEB"
            rounded="lg"
            p="1.25rem"
            cursor="pointer"
            _hover={{ borderColor: 'primary.300' }}
          >
            <Flex justify="space-between" align="start" gap="1rem">
              <Text fontSize="1rem" fontWeight="600">
                {report.title}
              </Text>
              <Text fontSize="1rem" fontWeight="700" color="primary.500">
                {report.value}
              </Text>
            </Flex>
            <Text fontSize=".875rem" color="gray.500" mt=".5rem">
              {report.description}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
