import { Box, Stack } from '@chakra-ui/react';
import { PageHeader } from '@/components/common/PageHeader';
import { ExpensesTable } from '../components/ExpensesTable';

/** Every organization's expenses. */
export function ExpensesTemplate() {
  return (
    <Stack gap="6">
      <PageHeader
        title="Expenses"
        subtitle="What every organization spent: parts, sublet work, towing and more"
      />
      <Box
        py={{ base: '1.25rem', md: '1.5rem' }}
        px={{ base: '0.75rem', md: '1rem' }}
        bg="white"
        rounded=".625rem"
        shadow="sm"
        borderWidth="1px"
        borderColor="gray.75"
      >
        <ExpensesTable />
      </Box>
    </Stack>
  );
}
