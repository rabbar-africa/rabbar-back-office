import { Box, Stack, Tabs } from '@chakra-ui/react';
import { PageHeader } from '@/components/common/PageHeader';
import { TabsTrigger } from '@/components/common/Tabs';
import { useUrlState } from '@/hooks/useUrlState';
import { BILLING_TABS } from '../data';
import { RunBillingButton } from '../components/RunBillingButton';
import { SubscriptionsTab } from '../components/SubscriptionsTab';
import { PaymentsTab } from '../components/PaymentsTab';
import { PlansTab } from '../components/PlansTab';

const TAB_SCHEMA = { tab: { defaultValue: 'subscriptions' } };

export function BillingTemplate() {
  const [{ tab }, setUrlState] = useUrlState(TAB_SCHEMA, { replace: true });

  return (
    <Stack gap="6" pb="3rem">
      <PageHeader
        title="Billing"
        subtitle="Every organization's subscription, the payment ledger, and plan pricing"
        action={<RunBillingButton />}
      />

      <Tabs.Root
        value={tab}
        onValueChange={(e) => setUrlState({ tab: e.value })}
        variant="plain"
      >
        <Tabs.List
          bg="white"
          rounded="md"
          p="1"
          gap="1"
          border="1px solid #EBEBEB"
          overflowX="auto"
          w="fit-content"
          maxW="100%"
        >
          {BILLING_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs.List>

        <Box mt="1.5rem">
          <Tabs.Content value="subscriptions">
            {tab === 'subscriptions' && <SubscriptionsTab />}
          </Tabs.Content>
          <Tabs.Content value="payments">
            {tab === 'payments' && <PaymentsTab />}
          </Tabs.Content>
          <Tabs.Content value="plans">
            {tab === 'plans' && <PlansTab />}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Stack>
  );
}
