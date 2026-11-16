import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import moment from 'moment';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import { CustomInput } from '@/components/input';
import { Logo } from '@/components/common/Logo';
import { EyeIcon, EyeOff, Lock } from '@/assets/custom';
import { RouteConstants } from '@/shared/constants/routes';
import { getErrorMessage } from '@/utils/handle-error';
import {
  useAcceptAdminInvite,
  useGetAdminInvite,
} from '@/features/admins/api/query';
import { BrandPanel } from './Login';

/** Same rule as the API (and the business app): 8 to 128 characters. */
const schema = Yup.object({
  password: Yup.string()
    .min(8, 'Use at least 8 characters')
    .max(128, 'Use 128 characters or fewer')
    .required('Choose a password'),
  confirm: Yup.string()
    .oneOf([Yup.ref('password')], "The passwords don't match")
    .required('Type the password again'),
});

/**
 * Public: where an admin's invite email lands (`/accept-invite?token=…`).
 * They choose their own password; the link proved the inbox, so accepting
 * signs them in without a code that one time.
 */
export function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const invite = useGetAdminInvite(token);

  return (
    <Grid
      minH="100dvh"
      templateColumns={{ base: '1fr', lg: '1.05fr 1fr' }}
      bg="white"
    >
      <BrandPanel />
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
          <Logo w="7.5rem" mb="2rem" display={{ base: 'block', lg: 'none' }} />

          {!token ? (
            <InviteProblem message="This link is missing its invite code. Open the link from your invite email again." />
          ) : invite.isPending ? (
            <Flex justify="center" py="3rem">
              <Spinner color="primary.300" />
            </Flex>
          ) : invite.isError ? (
            <InviteProblem
              message={
                (getErrorMessage(invite.error) as string) ||
                "This invite link doesn't work any more. Ask an owner for a new one."
              }
            />
          ) : (
            <ChoosePassword
              token={token}
              firstName={invite.data.firstName}
              email={invite.data.email}
              expiresAt={invite.data.expiresAt}
            />
          )}
        </Box>
      </Flex>
    </Grid>
  );
}

function ChoosePassword({
  token,
  firstName,
  email,
  expiresAt,
}: {
  token: string;
  firstName: string;
  email: string;
  expiresAt: string;
}) {
  const accept = useAcceptAdminInvite();
  const [show, setShow] = useState(false);

  const formik = useFormik({
    initialValues: { password: '', confirm: '' },
    validationSchema: schema,
    validateOnChange: false,
    onSubmit: (values) => accept.mutate({ token, password: values.password }),
  });

  const toggle = (
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
      aria-label={show ? 'Hide password' : 'Show password'}
      onClick={() => setShow((prev) => !prev)}
    >
      {show ? <EyeIcon w=".875rem" /> : <EyeOff w=".875rem" />}
    </chakra.button>
  );

  return (
    <Box>
      <Text
        fontSize={{ base: '1.5rem', md: '1.75rem' }}
        fontWeight="700"
        color="gray.500"
        letterSpacing="-0.02em"
        lineHeight="1.2"
      >
        Welcome{firstName ? `, ${firstName}` : ''}
      </Text>
      <Text textStyle="small-regular" color="gray.300" mt=".5rem">
        Choose a password for{' '}
        <Text as="span" fontWeight="600" color="gray.500">
          {email}
        </Text>{' '}
        to join the Rabbar back office. This link works until{' '}
        {moment(expiresAt).format('ddd D MMM, HH:mm')}.
      </Text>

      <chakra.form mt="2rem" onSubmit={formik.handleSubmit} noValidate>
        <Stack gap="1.25rem">
          {/* Lets password managers save the right account. */}
          <input
            type="email"
            name="username"
            autoComplete="username"
            value={email}
            readOnly
            hidden
          />
          <CustomInput
            label="Password"
            placeholder="At least 8 characters"
            type={show ? 'text' : 'password'}
            required
            disabled={accept.isPending}
            error={formik.touched.password ? formik.errors.password : undefined}
            inputProps={{
              name: 'password',
              autoComplete: 'new-password',
              autoFocus: true,
              value: formik.values.password,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              h: '3rem',
            }}
            leftElement={<Lock w=".75rem" color="gray.300" />}
            rightElement={toggle}
          />
          <CustomInput
            label="Confirm password"
            placeholder="Type it again"
            type={show ? 'text' : 'password'}
            required
            disabled={accept.isPending}
            error={formik.touched.confirm ? formik.errors.confirm : undefined}
            inputProps={{
              name: 'confirm',
              autoComplete: 'new-password',
              value: formik.values.confirm,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              h: '3rem',
            }}
            leftElement={<Lock w=".75rem" color="gray.300" />}
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
          loading={accept.isPending}
          loadingText="Setting up…"
        >
          Set password and sign in
        </Button>
      </chakra.form>

      <Text textStyle="tiny-regular" color="gray.300" mt="1.25rem">
        After this, you'll sign in with this password and a code we email you
        each time.
      </Text>
    </Box>
  );
}

function InviteProblem({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <Box>
      <Text
        fontSize={{ base: '1.5rem', md: '1.75rem' }}
        fontWeight="700"
        color="gray.500"
        letterSpacing="-0.02em"
        lineHeight="1.2"
      >
        This invite can't be used
      </Text>
      <Box
        role="alert"
        mt="1.25rem"
        bg="warning.50"
        rounded=".5rem"
        px=".875rem"
        py=".625rem"
      >
        <Text textStyle="small-regular" color="secondary.500">
          {message}
        </Text>
      </Box>
      <Button
        mt="2rem"
        width="full"
        h="3rem"
        variant="outline"
        rounded=".625rem"
        onClick={() => navigate(RouteConstants.auth.login.path)}
      >
        Go to sign in
      </Button>
    </Box>
  );
}
