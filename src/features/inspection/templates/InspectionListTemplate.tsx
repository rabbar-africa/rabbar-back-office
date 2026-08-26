import { Box, Stack } from '@chakra-ui/react';
import { PageHeader } from '@/components/common/PageHeader';
import { InspectionsTable } from '../components/inspection-list/InspectionsTable';

export function InspectionListTemplate() {
  return (
    <Stack gap="6">
      <PageHeader
        title="Inspections"
        subtitle="Vehicle inspection reports across every organization"
      />

      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.75"
        rounded=".625rem"
        shadow="sm"
        px={{ base: '0.75rem', md: '1rem' }}
        py={{ base: '1.25rem', md: '2rem' }}
      >
        <InspectionsTable />
      </Box>
    </Stack>
  );
}
