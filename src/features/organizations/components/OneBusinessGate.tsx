import type { ReactNode } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BuildingIcon } from '@/assets/custom/BuildingIcon';
import { useUrlState } from '@/hooks/useUrlState';
import { RouteConstants } from '@/shared/constants/routes';
import { OrganizationFilter } from './OrganizationFilter';

/**
 * `page` is the list's own page key: picking another business starts it
 * from the first page again.
 */
const GATE_SCHEMA = {
  business: { defaultValue: '' },
  businessName: { defaultValue: '' },
  page: { defaultValue: 1 },
};

export interface ChosenBusiness {
  id: string;
  name: string;
}

interface OneBusinessGateProps {
  /** What the page lists, for the copy: "invoices", "payments"… */
  records: string;
  /** The business page tab that shows the same list. */
  tab: string;
  /** The list, for the chosen business only. */
  children: (business: ChosenBusiness) => ReactNode;
}

/**
 * The back office shows one business's records at a time (compliance check
 * 16 Nov 2026; the API answers 400 without `organizationId`). Choose the
 * business first; only then does the list load. The choice lives in the URL,
 * so a link or a reload keeps it.
 */
export function OneBusinessGate({
  records,
  tab,
  children,
}: OneBusinessGateProps) {
  const [{ business, businessName }, setGate] = useUrlState(GATE_SCHEMA, {
    replace: true,
  });

  return (
    <Box
      bg="white"
      rounded=".625rem"
      shadow="sm"
      borderWidth="1px"
      borderColor="gray.75"
    >
      <Flex
        align={{ base: 'stretch', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap=".75rem"
        px={{ base: '0.75rem', md: '1rem' }}
        py="1rem"
        borderBottomWidth="1px"
        borderColor="gray.75"
      >
        <Text
          textStyle="small-semibold"
          color="gray.500"
          whiteSpace="nowrap"
          flexShrink={0}
        >
          Business
        </Text>
        <OrganizationFilter
          organizationId={business}
          organizationName={businessName}
          placeholder="Choose a business…"
          width={{ base: '100%', md: '22rem' }}
          onChange={(org) =>
            setGate({
              business: org?.id ?? '',
              businessName: org?.name ?? '',
              page: 1,
            })
          }
        />
        {business && (
          <Link
            to={RouteConstants.organizations.detail.generate(
              { id: business },
              { tab }
            )}
          >
            <Text
              fontSize="13px"
              fontWeight="500"
              color="primary.300"
              whiteSpace="nowrap"
              _hover={{ textDecoration: 'underline' }}
            >
              Open business page
            </Text>
          </Link>
        )}
      </Flex>

      {business ? (
        // Keyed, so the list's local state (search box…) starts fresh.
        <Box
          key={business}
          pt={{ base: '1.25rem', md: '1.5rem' }}
          pb={{ base: '1.25rem', md: '2rem' }}
          px={{ base: '0.75rem', md: '1rem' }}
        >
          {children({ id: business, name: businessName })}
        </Box>
      ) : (
        <ChooseBusinessFirst records={records} />
      )}
    </Box>
  );
}

/** The empty state until a business is chosen. */
export function ChooseBusinessFirst({
  records,
  hint,
}: {
  records: string;
  hint?: string;
}) {
  return (
    <Flex
      direction="column"
      align="center"
      textAlign="center"
      gap=".75rem"
      py="4rem"
      px="1.5rem"
    >
      <Flex
        boxSize="3rem"
        align="center"
        justify="center"
        rounded="full"
        bg="primary.50"
      >
        <Box as={BuildingIcon} boxSize="1.25rem" color="primary.300" />
      </Flex>
      <Text fontWeight="600" color="gray.500">
        Choose a business to see its {records}
      </Text>
      <Text textStyle="small-regular" color="gray.300" maxW="28rem">
        {hint ??
          "The back office shows one business's records at a time, and what you open is recorded in the access log."}
      </Text>
    </Flex>
  );
}
