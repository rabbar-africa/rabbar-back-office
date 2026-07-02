import { Box, Flex, Heading, Tabs, Text } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '@/assets/custom';
import SectionLoader from '@/components/common/SectionLoader';
import { TabsTrigger } from '@/components/common/Tabs';
import { RouteConstants } from '@/shared/constants/routes';
import { useUrlState } from '@/hooks/useUrlState';
import { useGetOrganizationById } from '../api/query';
import { DetailsForm } from '../components/edit/DetailsForm';
import { LogoForm } from '../components/edit/LogoForm';
import { AddressesSection } from '../components/edit/AddressesSection';
import { BankAccountsSection } from '../components/edit/BankAccountsSection';
import { TransactionSeriesSection } from '../components/edit/TransactionSeriesSection';

const TABS = [
  { value: 'details', label: 'Details' },
  { value: 'logo', label: 'Logo' },
  { value: 'addresses', label: 'Addresses' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'series', label: 'Transaction Series' },
];

const TAB_SCHEMA = { tab: { defaultValue: 'details' } };

export function OrganizationEditTemplate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [{ tab }, setUrlState] = useUrlState(TAB_SCHEMA, { replace: true });

  const { data, isPending } = useGetOrganizationById(id!);
  const org = data?.data;

  const goToDetails = () =>
    navigate(RouteConstants.organizations.detail.generate({ id: id! }));

  if (isPending) return <SectionLoader />;

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex align="center" gap=".75rem">
        <Box
          as="button"
          onClick={goToDetails}
          aria-label="Back to organization"
        >
          <ArrowLeft width="1.25rem" color="gray.500" />
        </Box>
        <Text fontSize=".875rem" color="gray.500">
          Back to Organization
        </Text>
      </Flex>

      <Flex align="center" gap=".75rem" wrap="wrap">
        <Heading fontSize="1.5rem" fontWeight="600">
          Edit {org?.name || 'Organization'}
        </Heading>
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

        <Box mt="1.5rem" pb="3rem">
          <Tabs.Content value="details">
            {tab === 'details' && <DetailsForm id={id!} org={org} />}
          </Tabs.Content>
          <Tabs.Content value="logo">
            {tab === 'logo' && <LogoForm id={id!} org={org} />}
          </Tabs.Content>
          <Tabs.Content value="addresses">
            {tab === 'addresses' && <AddressesSection id={id!} />}
          </Tabs.Content>
          <Tabs.Content value="accounts">
            {tab === 'accounts' && <BankAccountsSection id={id!} />}
          </Tabs.Content>
          <Tabs.Content value="series">
            {tab === 'series' && <TransactionSeriesSection id={id!} />}
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Flex>
  );
}
