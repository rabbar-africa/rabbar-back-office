import { Box, Button, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import type { IOrganization } from '@/shared/interface/common';

interface OrgSettingsTabProps {
  org?: IOrganization;
  onEdit: () => void;
}

export function OrgSettingsTab({ org, onEdit }: OrgSettingsTabProps) {
  const rows = [
    { label: 'Organization name', value: org?.name },
    { label: 'Email', value: org?.companyEmail || org?.email },
    { label: 'Phone', value: org?.phone },
    { label: 'Industry', value: org?.industry },
    { label: 'RC Number', value: org?.rcNumber },
    { label: 'Currency', value: org?.currency },
    { label: 'Timezone', value: org?.timezone },
    { label: 'Invoice prefix', value: org?.invoicePrefix },
    {
      label: 'Address',
      value: [org?.addressLine1, org?.city, org?.state, org?.country]
        .filter(Boolean)
        .join(', '),
    },
  ];

  return (
    <Box
      bg="white"
      border="1px solid #EBEBEB"
      rounded="lg"
      p="1.5rem"
      maxW="48rem"
    >
      <Flex justify="space-between" align="center" mb="1.5rem">
        <Text fontSize="1.125rem" fontWeight="600">
          Organization Settings
        </Text>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={onEdit}
        >
          Update Organization
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1.25rem">
        {rows.map((row) => (
          <Box key={row.label}>
            <Text fontSize=".8125rem" color="gray.500">
              {row.label}
            </Text>
            <Text fontSize=".9375rem" fontWeight="500" mt=".25rem">
              {row.value || '—'}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
