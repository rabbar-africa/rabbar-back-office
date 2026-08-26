import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Status from '@/components/ui/Status';
import { RouteConstants } from '@/shared/constants/routes';
import type { IOverviewRecentOrganization } from '@/shared/interface/overview';
import { SectionCard } from './SectionCard';

interface RecentOrganizationsProps {
  organizations: IOverviewRecentOrganization[];
}

export function RecentOrganizations({
  organizations,
}: RecentOrganizationsProps) {
  return (
    <SectionCard
      title="Recently onboarded"
      subtitle="The five newest organizations on the platform"
      action={
        <Link to={RouteConstants.organizations.base.path}>
          <Text textStyle="small-regular" color="primary.300">
            View all
          </Text>
        </Link>
      }
      flush
    >
      {organizations.length === 0 ? (
        <Text
          textStyle="small-regular"
          color="gray.300"
          px={{ base: '1rem', md: '1.25rem' }}
          py="1rem"
        >
          No organizations yet.
        </Text>
      ) : (
        <Stack gap="0">
          {organizations.map((org) => (
            <Flex
              key={org.id}
              justify="space-between"
              align="center"
              gap="3"
              px={{ base: '1rem', md: '1.25rem' }}
              py=".875rem"
              borderBottomWidth="1px"
              borderColor="gray.50"
              _last={{ borderBottomWidth: 0 }}
            >
              <Box minW={0}>
                <Link
                  to={RouteConstants.organizations.detail.generate({
                    id: org.id,
                  })}
                >
                  <Text
                    textStyle="small-semibold"
                    color="primary.300"
                    truncate
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {org.name}
                  </Text>
                </Link>
                <Text textStyle="tiny-regular" color="gray.300" mt=".125rem">
                  {org.userCount} user{org.userCount === 1 ? '' : 's'} ·{' '}
                  {moment(org.createdAt).format('DD MMM YYYY')}
                </Text>
              </Box>
              <Status
                name={org.isActive ? 'Active' : 'Inactive'}
                px=".5rem"
                w="auto"
                minW="4.5rem"
                h="1.75rem"
                whiteSpace="nowrap"
              />
            </Flex>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
