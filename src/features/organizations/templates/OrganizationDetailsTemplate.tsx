import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  Portal,
  Text,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs } from '@chakra-ui/react';
import { ArrowLeft } from '@/assets/custom';
import Status from '@/components/common/Status';
import SectionLoader from '@/components/common/SectionLoader';
import { TabsTrigger } from '@/components/common/Tabs';
import { RouteConstants } from '@/shared/constants/routes';
import { useUrlState } from '@/hooks/useUrlState';
import { useGetOrganizationById } from '../api/query';
import { OrgInvoicesTab } from '../components/tabs/OrgInvoicesTab';
import { OrgPaymentsTab } from '../components/tabs/OrgPaymentsTab';
import { OrgItemsTab } from '../components/tabs/OrgItemsTab';
import { OrgCustomersTab } from '../components/tabs/OrgCustomersTab';
import { OrgSubscriptionTab } from '../components/tabs/OrgSubscriptionTab';
import { OrgSettingsTab } from '../components/tabs/OrgSettingsTab';

const TABS = [
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'items', label: 'Items' },
  { value: 'customers', label: 'Customers' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'settings', label: 'Settings' },
];

const TAB_SCHEMA = { tab: { defaultValue: 'invoices' } };

export function OrganizationDetailsTemplate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [{ tab }, setUrlState] = useUrlState(TAB_SCHEMA, { replace: true });

  const { data, isPending } = useGetOrganizationById(id!);
  const org = data?.data;

  const goToEdit = () =>
    navigate(RouteConstants.organizations.edit.generate({ id: id! }));

  if (isPending) return <SectionLoader />;

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex align="center" gap=".75rem">
        <Box
          as="button"
          onClick={() => navigate(RouteConstants.organizations.base.path)}
          aria-label="Back to organizations"
        >
          <ArrowLeft width="1.25rem" color="gray.500" />
        </Box>
        <Text fontSize=".875rem" color="gray.500">
          Back to Organizations
        </Text>
      </Flex>

      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Flex align="center" gap=".75rem">
          <Heading fontSize="1.5rem" fontWeight="600">
            {org?.name || 'Organization'}
          </Heading>
          <Status name={org?.isActive ? 'active' : 'inactive'} />
        </Flex>

        <Menu.Root>
          <Menu.Trigger asChild>
            <Button
              bg="primary.500"
              color="white"
              _hover={{ bg: 'primary.600' }}
            >
              Actions
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="update" onClick={goToEdit}>
                  Update Organization
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>

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
        >
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs.List>

        <Box mt="1.5rem" pb={'3rem'}>
          <Tabs.Content value="invoices">
            {tab === 'invoices' && <OrgInvoicesTab />}
          </Tabs.Content>
          <Tabs.Content value="payments">
            {tab === 'payments' && <OrgPaymentsTab />}
          </Tabs.Content>
          <Tabs.Content value="items">
            {tab === 'items' && <OrgItemsTab />}
          </Tabs.Content>
          <Tabs.Content value="customers">
            {tab === 'customers' && <OrgCustomersTab />}
          </Tabs.Content>
          <Tabs.Content value="subscription">
            {tab === 'subscription' && <OrgSubscriptionTab />}
          </Tabs.Content>
          <Tabs.Content value="settings">
            {tab === 'settings' && (
              <OrgSettingsTab org={org} onEdit={goToEdit} />
            )}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Flex>
  );
}
