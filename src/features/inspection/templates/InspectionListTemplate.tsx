import { Stack } from '@chakra-ui/react';
import { PageHeader } from '@/components/common/PageHeader';
import { OneBusinessGate } from '@/features/organizations/components/OneBusinessGate';
import { InspectionsTable } from '../components/inspection-list/InspectionsTable';

/** One business's inspection reports at a time. */
export function InspectionListTemplate() {
  return (
    <Stack gap="6">
      <PageHeader
        title="Inspections"
        subtitle="A business's vehicle inspection reports"
      />
      <OneBusinessGate records="inspection reports" tab="inspections">
        {(business) => <InspectionsTable organizationId={business.id} />}
      </OneBusinessGate>
    </Stack>
  );
}
