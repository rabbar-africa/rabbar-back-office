import { Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { settingsSections } from '../data';

export function SettingsTemplate() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="1.5rem">
      <Heading fontSize="1.5rem" fontWeight="600">
        Settings
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="1rem">
        {settingsSections.map((section) => (
          <Box
            key={section.id}
            bg="white"
            border="1px solid #EBEBEB"
            rounded="lg"
            p="1.25rem"
            cursor="pointer"
            _hover={{ borderColor: 'primary.300' }}
            onClick={() => navigate(section.href)}
          >
            <Text fontSize="1rem" fontWeight="600">
              {section.title}
            </Text>
            <Text fontSize=".875rem" color="gray.500" mt=".5rem">
              {section.description}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
