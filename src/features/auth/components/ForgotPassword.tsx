import { useEffect, useState } from 'react';
import { Box, Button, Flex, Grid, Stack, Text, chakra } from '@chakra-ui/react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { CustomInput } from '@/components/input';
import { Logo } from '@/components/common/Logo';
import { EyeIcon, EyeOff, Lock, Mail } from '@/assets/custom';
import { RouteConstants } from '@/shared/constants/routes';
import { getErrorMessage } from '@/utils/handle-error';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../api';
import { BrandPanel } from './Login';

/** Sent with the user back to sign-in, which shows it. */
export interface SignInNotice {
  notice: string;
  email?: string;
}

/** Ask for a new code no more than once a minute. */
const RESEND_SECONDS = 60;

const emailSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email')
    .required('Email is required'),
});

/** Same rules as the API: a 6-digit code, a password of 8 to 128. */
const resetSchema = Yup.object({
  otp: Yup.string()
    .trim()
    .matches(/^\d{6}$/, 'Enter the 6-digit code from the email')
    .required('Enter the 6-digit code from the email'),
  password: Yup.string()
    .min(8, 'Use at least 8 characters')
    .max(128, 'Use 128 characters or fewer')
    .required('Choose a new password'),
  confirm: Yup.string()
    .oneOf([Yup.ref('password')], "The passwords don't match")
    .required('Type the password again'),
});

const textButton = {
  variant: 'ghost',
  p: '0',
  h: 'auto',
  minW: 0,
  fontSize: '13px',
  fontWeight: '500',
  _loading: { bg: 'transparent', opacity: 0.7 },
  _disabled: { bg: 'transparent', color: 'gray.300', cursor: 'not-allowed' },
} as const;

const heading = {
  fontSize: { base: '1.5rem', md: '1.75rem' },
  fontWeight: '700',
  color: 'gray.500',
  letterSpacing: '-0.02em',
  lineHeight: '1.2',
} as const;

const primaryButton = {
  width: 'full',
  h: '3rem',
  bg: 'primary.300',
  color: 'white',
  fontWeight: '600',
  rounded: '.625rem',
  _hover: { bg: 'primary.400' },
  _active: { bg: 'primary.500' },
} as const;

/**
 * Public: a back-office admin who forgot their password. Their email gets a
 * 6-digit code (the business app's reset, the same account); the code and a
 * new password set it, and every session of the account ends. Then they sign
 * in here as usual, with the password and an emailed sign-in code.
 */
export function ForgotPassword() {
  // The email the code went to; null = still asking for it.
  const [sentTo, setSentTo] = useState<{ email: string; at: number } | null>(
    null
  );

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
          {sentTo ? (
            <ChooseNewPassword
              email={sentTo.email}
              sentAt={sentTo.at}
              onResent={(at) => setSentTo({ email: sentTo.email, at })}
              onChangeEmail={() => setSentTo(null)}
            />
          ) : (
            <AskForEmail
              onSent={(email) => setSentTo({ email, at: Date.now() })}
            />
          )}
        </Box>
      </Flex>
    </Grid>
  );
}

function BackToSignIn() {
  const navigate = useNavigate();
  return (
    <Button
      {...textButton}
      color="gray.300"
      _hover={{ color: 'gray.500' }}
      onClick={() => navigate(RouteConstants.auth.login.path)}
    >
      Back to sign in
    </Button>
  );
}

function AskForEmail({ onSent }: { onSent: (email: string) => void }) {
  const forgot = useForgotPasswordMutation();
  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: emailSchema,
    validateOnChange: false,
    onSubmit: (values) => {
      const email = values.email.trim().toLowerCase();
      // Errors (network, 5xx) are shown by the global toast.
      forgot.mutate(email, { onSuccess: () => onSent(email) });
    },
  });

  return (
    <Box>
      <Text {...heading}>Reset your password</Text>
      <Text textStyle="small-regular" color="gray.300" mt=".5rem">
        Enter the email you sign in with. If it has a back-office account, we'll
        email it a 6-digit code to set a new password.
      </Text>

      <chakra.form mt="2rem" onSubmit={formik.handleSubmit} noValidate>
        <CustomInput
          label="Email"
          placeholder="you@rabbar.africa"
          required
          disabled={forgot.isPending}
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
        <Button
          {...primaryButton}
          mt="2rem"
          type="submit"
          loading={forgot.isPending}
          loadingText="Sending…"
        >
          Email me a code
        </Button>
      </chakra.form>

      <Flex mt="1.25rem">
        <BackToSignIn />
      </Flex>
    </Box>
  );
}

/** Ticks once a second while mounted. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function ChooseNewPassword({
  email,
  sentAt,
  onResent,
  onChangeEmail,
}: {
  email: string;
  sentAt: number;
  onResent: (at: number) => void;
  onChangeEmail: () => void;
}) {
  const navigate = useNavigate();
  const reset = useResetPasswordMutation();
  const resend = useForgotPasswordMutation();
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = useNow();
  const resendIn = Math.ceil((sentAt + RESEND_SECONDS * 1000 - now) / 1000);

  const formik = useFormik({
    initialValues: { otp: '', password: '', confirm: '' },
    validationSchema: resetSchema,
    validateOnChange: false,
    onSubmit: (values) => {
      setError(null);
      reset.mutate(
        { email, otp: values.otp, password: values.password },
        {
          onSuccess: () => {
            const state: SignInNotice = {
              notice:
                'Your password has been changed and you were signed out everywhere. Sign in with your new password.',
              email,
            };
            navigate(RouteConstants.auth.login.path, { replace: true, state });
          },
          // "Invalid or expired reset code": stay and try again.
          onError: (err) =>
            setError(
              (getErrorMessage(err) as string) ||
                'That code is wrong or has expired. Try again, or send a new code.'
            ),
        }
      );
    },
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
      <Text {...heading}>Check your email</Text>
      <Text textStyle="small-regular" color="gray.300" mt=".5rem">
        If{' '}
        <Text as="span" fontWeight="600" color="gray.500">
          {email}
        </Text>{' '}
        has a back-office account, we've emailed it a 6-digit code. It expires
        in 10 minutes.
      </Text>

      {error && (
        <Box
          role="alert"
          mt="1.25rem"
          bg="warning.50"
          rounded=".5rem"
          px=".875rem"
          py=".625rem"
        >
          <Text textStyle="tiny-regular" color="secondary.500">
            {error}
          </Text>
        </Box>
      )}

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
            label="Code from the email"
            placeholder="6 digits"
            required
            disabled={reset.isPending}
            error={formik.touched.otp ? formik.errors.otp : undefined}
            inputProps={{
              name: 'otp',
              inputMode: 'numeric',
              autoComplete: 'one-time-code',
              maxLength: 6,
              autoFocus: true,
              value: formik.values.otp,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              h: '3rem',
            }}
          />
          <CustomInput
            label="New password"
            placeholder="At least 8 characters"
            type={show ? 'text' : 'password'}
            required
            disabled={reset.isPending}
            error={formik.touched.password ? formik.errors.password : undefined}
            inputProps={{
              name: 'password',
              autoComplete: 'new-password',
              value: formik.values.password,
              onChange: formik.handleChange,
              onBlur: formik.handleBlur,
              h: '3rem',
            }}
            leftElement={<Lock w=".75rem" color="gray.300" />}
            rightElement={toggle}
          />
          <CustomInput
            label="Confirm new password"
            placeholder="Type it again"
            type={show ? 'text' : 'password'}
            required
            disabled={reset.isPending}
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
          {...primaryButton}
          mt="2rem"
          type="submit"
          loading={reset.isPending}
          loadingText="Saving…"
        >
          Set new password
        </Button>
      </chakra.form>

      <Flex
        mt="1.25rem"
        justify="space-between"
        align="center"
        gap="1rem"
        wrap="wrap"
      >
        <Button
          {...textButton}
          color="primary.300"
          _hover={{ textDecoration: 'underline' }}
          disabled={resendIn > 0 || resend.isPending || reset.isPending}
          loading={resend.isPending}
          loadingText="Sending…"
          onClick={() =>
            resend.mutate(email, {
              onSuccess: () => {
                setError(null);
                formik.setFieldValue('otp', '', false);
                onResent(Date.now());
              },
            })
          }
        >
          {resendIn > 0
            ? `Send a new code in 0:${String(resendIn).padStart(2, '0')}`
            : 'Send a new code'}
        </Button>
        <Button
          {...textButton}
          color="gray.300"
          _hover={{ color: 'gray.500' }}
          disabled={reset.isPending}
          onClick={onChangeEmail}
        >
          Use a different email
        </Button>
      </Flex>
      <Flex mt=".75rem">
        <BackToSignIn />
      </Flex>
    </Box>
  );
}
