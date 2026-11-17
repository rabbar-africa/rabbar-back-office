import { useState } from 'react';
import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import ConsentDialog from '@/components/common/ConsentDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { useLogoutAllMutation } from '@/features/auth/api/query';
import { RouteConstants } from '@/shared/constants/routes';

/** Settings → Sign-in & security: the admin's own sessions. */
export function SignInSecurity() {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const { mutate: logoutAll, isPending } = useLogoutAllMutation();

  return (
    <Stack gap="1.5rem">
      <Box>
        <Button
          size="xs"
          variant="ghost"
          color="black"
          px="1"
          mb="2"
          onClick={() => navigate(RouteConstants.settings.base.path)}
        >
          ← Settings
        </Button>
        <PageHeader
          title="Sign-in & security"
          subtitle="Where your account is signed in"
        />
      </Box>

      <Flex
        bg="white"
        border="1px solid #EBEBEB"
        rounded="lg"
        p="1.25rem"
        gap="1rem"
        align={{ base: 'stretch', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
      >
        <Box>
          <Text fontSize="1rem" fontWeight="600" color="black">
            Sign out of all devices
          </Text>
          <Text fontSize=".875rem" color="gray.500" mt=".25rem" maxW="520px">
            Signs your back office account out on every device, including this
            one. Use it if you lost a device or think someone else used your
            account.
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          color="black"
          borderColor="gray.200"
          flexShrink={0}
          onClick={() => setConfirming(true)}
        >
          Sign out of all devices
        </Button>
      </Flex>

      <ConsentDialog
        open={confirming}
        onOpenChange={({ open }) => {
          if (!open && !isPending) setConfirming(false);
        }}
        handleSubmit={() => logoutAll()}
        isLoading={isPending}
        variant="warning"
        heading="Sign out of all devices?"
        note="Every device signed in to your account will be signed out, and you'll be signed out here too."
        confirmText="Sign out everywhere"
      />
    </Stack>
  );
}
