import { Stack } from '@chakra-ui/react';
import { PageHeader } from '@/components/common/PageHeader';
import { OneBusinessGate } from '@/features/organizations/components/OneBusinessGate';
import { ExpensesTable } from '../components/ExpensesTable';

/** One business's expenses at a time. */
export function ExpensesTemplate() {
  return (
    <Stack gap="6">
      <PageHeader
        title="Expenses"
        subtitle="What a business spent: parts, sublet work, towing and more"
      />
      <OneBusinessGate records="expenses" tab="expenses">
        {(business) => <ExpensesTable organizationId={business.id} />}
      </OneBusinessGate>
    </Stack>
  );
}
