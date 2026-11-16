import { Box, Stack } from '@chakra-ui/react';
import { PageHeader } from '@/components/common/PageHeader';
import { AccessLogTable } from '../components/AccessLogTable';
import { OwnersOnly } from '../components/OwnersOnly';

/** Who opened and changed what in the back office. Owners only. */
export function AccessLogTemplate() {
  return (
    <Stack gap="6">
      <PageHeader
        title="Access log"
        subtitle="Every business, record and change an admin opened, and every sign-in. Kept for two years."
      />
      <OwnersOnly>
        <Box
          py={{ base: '1.25rem', md: '1.5rem' }}
          px={{ base: '0.75rem', md: '1rem' }}
          bg="white"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <AccessLogTable />
        </Box>
      </OwnersOnly>
    </Stack>
  );
}
