import type { ElementType } from 'react';
import { useState } from 'react';
import { Box, Button, Flex, Grid, Stack, Text, chakra } from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CustomInput } from '@/components/input';
import { Logo } from '@/components/common/Logo';
import { EyeIcon, EyeOff, Lock, Mail } from '@/assets/custom';
import { BuildingIcon } from '@/assets/custom/BuildingIcon';
import { ChatCircle } from '@/assets/custom/ChatCircle';
import { CalendarDotsIcon } from '@/assets/custom/CalendarDotsIcon';
import { useLoginMutation } from '../api';

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

/** What the back office is for, shown on the brand panel. */
const HIGHLIGHTS: Array<{ icon: ElementType; title: string; text: string }> = [
  {
    icon: BuildingIcon,
    title: 'Every organization',
    text: 'Accounts, users, invoices and payments across the platform.',
  },
  {
    icon: CalendarDotsIcon,
    title: 'Billing and plans',
    text: 'Subscriptions, payments, plan pricing and promo codes.',
  },
  {
    icon: ChatCircle,
    title: 'The WhatsApp bot',
    text: 'Who uses it, what they get done, and what it costs.',
  },
];

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const isPending = loginMutation.isPending;

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      loginMutation.mutate({
        // Normalize to guard against mobile keyboards that auto-capitalize.
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    },
  });

  return (
    <Grid
      minH="100dvh"
      templateColumns={{ base: '1fr', lg: '1.05fr 1fr' }}
      bg="white"
    >
      <BrandPanel />

      {/* Sign-in form */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        minW={0}
        px={{ base: '1.25rem', md: '3rem' }}
        py={{ base: '3rem', md: '4rem' }}
        bg={{ base: 'gray.50', lg: 'white' }}
      >
        <Box
          w="100%"
          maxW="26rem"
          bg="white"
          rounded={{ base: '1rem', lg: 'none' }}
          shadow={{ base: 'sm', lg: 'none' }}
          borderWidth={{ base: '1px', lg: '0' }}
          borderColor="gray.75"
          p={{ base: '1.75rem', md: '2.25rem', lg: '0' }}
        >
          {/* The brand panel is hidden on small screens, so show the logo here. */}
          <Logo w="7.5rem" mb="2rem" display={{ base: 'block', lg: 'none' }} />

          <Text
            fontSize={{ base: '1.5rem', md: '1.75rem' }}
            fontWeight="700"
            color="gray.500"
            letterSpacing="-0.02em"
            lineHeight="1.2"
          >
            Welcome back
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt=".5rem">
            Sign in to the Rabbar back office.
          </Text>

          <chakra.form mt="2rem" onSubmit={formik.handleSubmit} noValidate>
            <Stack gap="1.25rem">
              <CustomInput
                label="Email"
                placeholder="you@rabbar.africa"
                required
                disabled={isPending}
                error={formik.touched.email ? formik.errors.email : undefined}
                inputProps={{
                  name: 'email',
                  type: 'email',
                  autoComplete: 'username',
                  autoFocus: true,
                  value: formik.values.email,
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                  h: '3rem',
                }}
                leftElement={<Mail w=".875rem" color="gray.300" />}
              />

              <CustomInput
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isPending}
                error={
                  formik.touched.password ? formik.errors.password : undefined
                }
                inputProps={{
                  name: 'password',
                  autoComplete: 'current-password',
                  value: formik.values.password,
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                  h: '3rem',
                }}
                leftElement={<Lock w=".75rem" color="gray.300" />}
                rightElement={
                  <chakra.button
                    type="button"
                    display="flex"
                    cursor="pointer"
                    alignItems="center"
                    justifyContent="center"
                    boxSize="2rem"
                    rounded="md"
                    color="gray.300"
                    _hover={{ color: 'gray.500', bg: 'gray.50' }}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeIcon w=".875rem" />
                    ) : (
                      <EyeOff w=".875rem" />
                    )}
                  </chakra.button>
                }
              />
            </Stack>

            <Button
              mt="2rem"
              width="full"
              h="3rem"
              type="submit"
              bg="primary.300"
              color="white"
              fontWeight="600"
              rounded=".625rem"
              _hover={{ bg: 'primary.400' }}
              _active={{ bg: 'primary.500' }}
              loading={isPending}
              loadingText="Signing in…"
              disabled={isPending}
            >
              Sign in
            </Button>
          </chakra.form>

          <Flex
            mt="2rem"
            pt="1.25rem"
            borderTopWidth="1px"
            borderColor="gray.75"
            align="center"
            gap=".5rem"
          >
            <Box boxSize=".5rem" rounded="full" bg="secondary.300" />
            <Text textStyle="tiny-regular" color="gray.300">
              Access is limited to Rabbar platform administrators.
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Grid>
  );
}

/** Left half on large screens: the brand, and what the back office does. */
function BrandPanel() {
  return (
    <Flex
      display={{ base: 'none', lg: 'flex' }}
      direction="column"
      justify="space-between"
      position="relative"
      overflow="hidden"
      bg="primary.500"
      color="white"
      px={{ lg: '3.5rem', xl: '5rem' }}
      py="3rem"
    >
      {/* Faint grid, fading out from the top-left corner. */}
      <Box
        position="absolute"
        inset="0"
        pointerEvents="none"
        css={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage:
            'radial-gradient(ellipse at 0% 0%, black 25%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 0% 0%, black 25%, transparent 75%)',
        }}
      />
      {/* Lime glow and the logo's dot, echoed large. */}
      <Box
        position="absolute"
        top="-8rem"
        right="-6rem"
        boxSize="26rem"
        rounded="full"
        bg="secondary.300"
        opacity={0.14}
        filter="blur(90px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom={{ lg: '-5rem', xl: '-7rem' }}
        right={{ lg: '-5rem', xl: '-7rem' }}
        boxSize={{ lg: '13rem', xl: '20rem' }}
        rounded="full"
        bg="secondary.300"
        opacity={0.9}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom={{ lg: '-5rem', xl: '-7rem' }}
        right={{ lg: '-5rem', xl: '-7rem' }}
        boxSize={{ lg: '13rem', xl: '20rem' }}
        rounded="full"
        borderWidth="1px"
        borderColor="whiteAlpha.300"
        transform="scale(1.35)"
        pointerEvents="none"
      />

      <Box position="relative">
        <Logo color="white" w="9rem" />
      </Box>

      <Box position="relative" maxW="30rem" my="3rem">
        <Flex
          display="inline-flex"
          align="center"
          gap=".5rem"
          px=".75rem"
          py=".25rem"
          rounded="full"
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          mb="1.5rem"
        >
          <Box boxSize=".375rem" rounded="full" bg="secondary.300" />
          <Text fontSize="12px" fontWeight="500" color="whiteAlpha.900">
            Back Office
          </Text>
        </Flex>

        <Text
          fontSize={{ lg: '2.25rem', xl: '2.75rem' }}
          fontWeight="700"
          lineHeight="1.15"
          letterSpacing="-0.03em"
        >
          Run the whole platform{' '}
          <Text as="span" color="secondary.300">
            from one place.
          </Text>
        </Text>
        <Text
          mt="1rem"
          fontSize="15px"
          lineHeight="1.7"
          color="whiteAlpha.700"
          maxW="26rem"
        >
          See what every workshop is doing, keep billing healthy, and catch
          problems before customers do.
        </Text>

        <Stack gap="1.25rem" mt="2.5rem">
          {HIGHLIGHTS.map((item) => (
            <Flex key={item.title} gap="1rem" align="flex-start">
              <Flex
                boxSize="2.5rem"
                flexShrink={0}
                align="center"
                justify="center"
                rounded=".75rem"
                bg="whiteAlpha.100"
                borderWidth="1px"
                borderColor="whiteAlpha.200"
              >
                <Box as={item.icon} boxSize="1.125rem" color="secondary.300" />
              </Flex>
              <Box>
                <Text fontSize="14px" fontWeight="600">
                  {item.title}
                </Text>
                <Text fontSize="13px" color="whiteAlpha.700" mt="2px">
                  {item.text}
                </Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      </Box>

      <Text position="relative" fontSize="12px" color="whiteAlpha.600">
        © {new Date().getFullYear()} Rabbar Africa · Internal use only
      </Text>
    </Flex>
  );
}
