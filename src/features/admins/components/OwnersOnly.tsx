import type { ReactNode } from 'react';
import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { ShieldIcon } from '@/assets/custom/ShieldIcon';
import { useAdminPermissions } from '../api';

/**
 * Renders `children` only for the back-office owners (the API refuses the
 * same routes with 403 for everyone else).
 */
export function OwnersOnly({ children }: { children: ReactNode }) {
  const { canManageAdmins, isPending } = useAdminPermissions();

  if (isPending)
    return (
      <Flex justify="center" py="4rem">
        <Spinner color="primary.300" />
      </Flex>
    );

  if (!canManageAdmins)
    return (
      <Flex
        direction="column"
        align="center"
        textAlign="center"
        gap=".75rem"
        py="4rem"
        px="1.5rem"
        bg="white"
        rounded=".625rem"
        borderWidth="1px"
        borderColor="gray.75"
      >
        <Flex
          boxSize="3rem"
          align="center"
          justify="center"
          rounded="full"
          bg="primary.50"
        >
          <Box as={ShieldIcon} boxSize="1.25rem" color="primary.300" />
        </Flex>
        <Text fontWeight="600" color="gray.500">
          Only the back-office owners can see this
        </Text>
        <Text textStyle="small-regular" color="gray.300" maxW="26rem">
          Ask an owner if you need to know who opened what.
        </Text>
      </Flex>
    );

  return <>{children}</>;
}
