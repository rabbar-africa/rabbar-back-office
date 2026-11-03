import { Box, Button, Center, Flex, Stack, Text } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';
import { Logo } from '../common/Logo';

interface NotFoundProps {
  /**
   * Standalone page (no app layout around it): fills the screen and shows the
   * logo. Inside the dashboard, leave it off so the sidebar stays in place.
   */
  fullPage?: boolean;
}

/** 404 for any address that doesn't match a page. */
export function NotFound({ fullPage = false }: NotFoundProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // A direct visit has nowhere to go back to inside the app.
  const canGoBack =
    typeof window !== 'undefined' && (window.history.state?.idx ?? 0) > 0;

  return (
    <Center
      minH={fullPage ? '100dvh' : '70vh'}
      px="1.5rem"
      py="3rem"
      bg={fullPage ? 'gray.50' : 'transparent'}
      position="relative"
      overflow="hidden"
    >
      {/* Soft lime glow behind the number, echoing the logo's dot. */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -70%)"
        boxSize="22rem"
        rounded="full"
        bg="secondary.300"
        opacity={0.12}
        filter="blur(80px)"
        pointerEvents="none"
      />

      <Stack
        position="relative"
        align="center"
        textAlign="center"
        gap="1.25rem"
        maxW="30rem"
      >
        {fullPage && <Logo w="8rem" mb="1rem" />}

        <Box position="relative" lineHeight="1">
          <Text
            fontSize={{ base: '5.5rem', md: '7.5rem' }}
            fontWeight="800"
            letterSpacing="-0.05em"
            color="primary.300"
            lineHeight="1"
          >
            404
          </Text>
          <Box
            position="absolute"
            right={{ base: '-1.1rem', md: '-1.5rem' }}
            bottom={{ base: '.75rem', md: '1rem' }}
            boxSize={{ base: '1rem', md: '1.375rem' }}
            rounded="full"
            bg="secondary.300"
          />
        </Box>

        <Text
          fontSize={{ base: '1.25rem', md: '1.5rem' }}
          fontWeight="700"
          color="gray.500"
          letterSpacing="-0.01em"
        >
          This page doesn&apos;t exist
        </Text>
        <Text textStyle="small-regular" color="gray.300" lineHeight="1.7">
          The link may be broken, or the page may have moved. Check the address,
          or head back to the dashboard.
        </Text>

        <Box
          maxW="100%"
          px=".75rem"
          py=".375rem"
          rounded=".5rem"
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Text
            fontFamily="mono"
            fontSize="12px"
            color="gray.400"
            wordBreak="break-all"
          >
            {pathname}
          </Text>
        </Box>

        <Flex gap=".75rem" wrap="wrap" justify="center" mt=".5rem">
          {canGoBack && (
            <Button
              variant="outline"
              borderColor="gray.75"
              bg="white"
              color="gray.500"
              _hover={{ bg: 'gray.50' }}
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
          )}
          <Button
            bg="primary.300"
            color="white"
            _hover={{ bg: 'primary.400' }}
            onClick={() => navigate(RouteConstants.overview.base.path)}
          >
            Go to dashboard
          </Button>
        </Flex>
      </Stack>
    </Center>
  );
}
