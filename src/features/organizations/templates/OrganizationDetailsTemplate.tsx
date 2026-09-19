import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  Portal,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs } from '@chakra-ui/react';
import { ArrowLeft } from '@/assets/custom';
import Status from '@/components/common/Status';
import SectionLoader from '@/components/common/SectionLoader';
import { RouteConstants } from '@/shared/constants/routes';
import { useUrlState } from '@/hooks/useUrlState';
import { useGetOrganizationById } from '../api/query';
import { OrgInvoicesTab } from '../components/tabs/OrgInvoicesTab';
import { OrgPaymentsTab } from '../components/tabs/OrgPaymentsTab';
import { OrgItemsTab } from '../components/tabs/OrgItemsTab';
import { OrgCustomersTab } from '../components/tabs/OrgCustomersTab';
import { OrgSubscriptionTab } from '../components/tabs/OrgSubscriptionTab';
import { OrgSettingsTab } from '../components/tabs/OrgSettingsTab';
import { OrgRolesTab } from '../components/tabs/OrgRolesTab';
import { OrgInspectionsTab } from '../components/tabs/OrgInspectionsTab';
import { OrgJobCardsTab } from '../components/tabs/OrgJobCardsTab';
import { OrgWhatsappTab } from '../components/tabs/OrgWhatsappTab';
import { DeleteOrganizationModal } from '../components/DeleteOrganizationModal';
import {
  ORG_DETAIL_TABS,
  OrgDetailsTabBar,
} from '../components/OrgDetailsTabBar';

const TAB_SCHEMA = { tab: { defaultValue: 'invoices' } };

export function OrganizationDetailsTemplate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [{ tab }, setUrlState] = useUrlState(TAB_SCHEMA, { replace: true });
  // An unknown ?tab= (old link, typo) falls back instead of showing nothing.
  const activeTab = ORG_DETAIL_TABS.some((t) => t.value === tab)
    ? tab
    : TAB_SCHEMA.tab.defaultValue;

  const [deleteOpen, setDeleteOpen] = useState(false);

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
          <Avatar.Root
            shape="rounded"
            size="lg"
            border="1px solid"
            borderColor="gray.75"
            bg="gray.50"
          >
            <Avatar.Fallback name={org?.name || 'Organization'} />
            <Avatar.Image
              src={org?.logoUrl || ''}
              alt={`${org?.name || 'organization'} logo`}
            />
          </Avatar.Root>
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
                <Menu.Item
                  value="delete"
                  color="error.300"
                  _hover={{ bg: 'error.50', color: 'error.300' }}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete Organization
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>

      <Tabs.Root
        value={activeTab}
        onValueChange={(e) => setUrlState({ tab: e.value })}
        variant="plain"
      >
        <OrgDetailsTabBar
          value={activeTab}
          onChange={(value) => setUrlState({ tab: value })}
        />

        <Box mt="1.5rem" pb={'3rem'}>
          <Tabs.Content value="inspections">
            {activeTab === 'inspections' && <OrgInspectionsTab />}
          </Tabs.Content>
          <Tabs.Content value="job-cards">
            {activeTab === 'job-cards' && <OrgJobCardsTab />}
          </Tabs.Content>
          <Tabs.Content value="invoices">
            {activeTab === 'invoices' && <OrgInvoicesTab />}
          </Tabs.Content>
          <Tabs.Content value="payments">
            {activeTab === 'payments' && <OrgPaymentsTab />}
          </Tabs.Content>
          <Tabs.Content value="items">
            {activeTab === 'items' && <OrgItemsTab />}
          </Tabs.Content>
          <Tabs.Content value="customers">
            {activeTab === 'customers' && <OrgCustomersTab />}
          </Tabs.Content>
          <Tabs.Content value="subscription">
            {activeTab === 'subscription' && <OrgSubscriptionTab />}
          </Tabs.Content>
          <Tabs.Content value="whatsapp">
            {activeTab === 'whatsapp' && <OrgWhatsappTab />}
          </Tabs.Content>
          <Tabs.Content value="roles">
            {activeTab === 'roles' && <OrgRolesTab />}
          </Tabs.Content>
          <Tabs.Content value="settings">
            {activeTab === 'settings' && (
              <OrgSettingsTab org={org} onEdit={goToEdit} />
            )}
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      {org && (
        <DeleteOrganizationModal
          open={deleteOpen}
          onOpenChange={({ open }) => setDeleteOpen(open)}
          orgId={id!}
          orgName={org.name}
          onDeleted={() =>
            navigate(RouteConstants.organizations.base.path, { replace: true })
          }
        />
      )}
    </Flex>
  );
}
