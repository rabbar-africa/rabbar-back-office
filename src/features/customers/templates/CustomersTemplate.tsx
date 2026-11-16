import { Stack } from '@chakra-ui/react';
import { PageHeader } from '@/components/common/PageHeader';
import { OneBusinessGate } from '@/features/organizations/components/OneBusinessGate';
import { OrgCustomersTab } from '@/features/organizations/components/tabs/OrgCustomersTab';

/** One business's customers at a time. */
export function CustomersTemplate() {
  return (
    <Stack gap="6">
      <PageHeader title="Customers" subtitle="A business's customers" />
      {/* No prefix, so the gate's page reset applies to this list. */}
      <OneBusinessGate records="customers" tab="customers">
        {(business) => (
          <OrgCustomersTab organizationId={business.id} urlPrefix="" />
        )}
      </OneBusinessGate>
    </Stack>
  );
}
