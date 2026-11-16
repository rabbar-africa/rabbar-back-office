import { useEffect, useState } from 'react';
import { Box, Button, Flex, PinInput, Text, chakra } from '@chakra-ui/react';
import type { AxiosError } from 'axios';
import { getErrorMessage } from '@/utils/handle-error';
import { useVerifySignInMutation } from '../api';
import type { SignInChallenge } from '../api/types';

/** The API allows a new code once a minute. */
const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;

export interface PendingSignIn extends SignInChallenge {
  /** When this code was sent (ms), for the resend wait. */
  sentAt: number;
}

interface SignInCodeProps {
  challenge: PendingSignIn;
  /** Ask for a new code with the same email and password. */
  onResend: () => Promise<void>;
  resending: boolean;
  /** Back to email and password; `reason` is shown there. */
  onRestart: (reason?: string) => void;
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

/**
 * A link-style button. The theme's button recipe has no `plain` variant
 * (it falls back to the filled base and hides the text), so use `ghost`
 * and strip its padding, loading fill and disabled colour.
 */
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

const mmss = (seconds: number) => {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * Sign-in step 2: the 6-digit code emailed after the password. Only the code
 * signs the admin in; the password alone never does.
 */
export function SignInCode({
  challenge,
  onResend,
  resending,
  onRestart,
}: SignInCodeProps) {
  const verify = useVerifySignInMutation();
  const [code, setCode] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const now = useNow();

  // A new code replaces the old one: start clean.
  useEffect(() => {
    setCode([]);
    setError(null);
  }, [challenge.challengeId]);

  const expiresIn = (new Date(challenge.expiresAt).getTime() - now) / 1000;
  const resendIn = (challenge.sentAt + RESEND_SECONDS * 1000 - now) / 1000;
  const expired = expiresIn <= 0;

  const submit = (value: string) => {
    if (value.length !== CODE_LENGTH || verify.isPending || expired) return;
    setError(null);
    verify.mutate(
      { challengeId: challenge.challengeId, code: value },
      {
        onError: (err) => {
          const status = (err as AxiosError).response?.status;
          const message = getErrorMessage(err) as string;
          // Locked (403), expired (410) or already used/replaced: this
          // sign-in is over, so start it again from the password.
          if (
            status === 403 ||
            status === 410 ||
            /sign-in has ended/i.test(message ?? '')
          ) {
            onRestart(message);
            return;
          }
          // A wrong code (400 "… N tries left."): stay and try again.
          setError(message || 'That code is not right. Try again.');
          setCode([]);
        },
      }
    );
  };

  return (
    <Box>
      <Text
        fontSize={{ base: '1.5rem', md: '1.75rem' }}
        fontWeight="700"
        color="gray.500"
        letterSpacing="-0.02em"
        lineHeight="1.2"
      >
        Check your email
      </Text>
      <Text textStyle="small-regular" color="gray.300" mt=".5rem">
        We emailed a 6-digit code to{' '}
        <Text as="span" fontWeight="600" color="gray.500">
          {challenge.sentTo}
        </Text>
        . It expires in 10 minutes.
      </Text>

      <chakra.form
        mt="2rem"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit(code.join(''));
        }}
      >
        <PinInput.Root
          otp
          type="numeric"
          autoFocus
          size="lg"
          value={code}
          invalid={Boolean(error)}
          disabled={verify.isPending || expired}
          onValueChange={(e) => {
            setCode(e.value);
            if (error) setError(null);
          }}
          onValueComplete={(e) => submit(e.valueAsString)}
        >
          <PinInput.Label
            display="block"
            textStyle="tiny-semibold"
            color="gray.300"
            mb=".625rem"
          >
            Sign-in code
          </PinInput.Label>
          <PinInput.HiddenInput name="code" autoComplete="one-time-code" />
          <PinInput.Control
            display="grid"
            gridTemplateColumns={`repeat(${CODE_LENGTH}, 1fr)`}
            gap={{ base: '.5rem', sm: '.75rem' }}
          >
            {Array.from({ length: CODE_LENGTH }, (_, index) => (
              <PinInput.Input
                key={index}
                index={index}
                w="100%"
                h="3.25rem"
                fontSize="1.25rem"
                fontWeight="600"
                rounded=".625rem"
                // Chakra's default placeholder is "○"; empty boxes read better.
                placeholder=""
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </PinInput.Control>
        </PinInput.Root>

        <Text
          role={error ? 'alert' : undefined}
          textStyle="tiny-regular"
          color={error || expired ? 'error.300' : 'gray.300'}
          mt=".625rem"
          minH="1.25rem"
        >
          {error ??
            (expired
              ? 'This code has expired. Send a new one, or start again.'
              : `Code expires in ${mmss(expiresIn)}`)}
        </Text>

        <Button
          mt="1.5rem"
          width="full"
          h="3rem"
          type="submit"
          bg="primary.300"
          color="white"
          fontWeight="600"
          rounded=".625rem"
          _hover={{ bg: 'primary.400' }}
          _active={{ bg: 'primary.500' }}
          loading={verify.isPending}
          loadingText="Checking…"
          disabled={code.join('').length !== CODE_LENGTH || expired}
        >
          Sign in
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
          disabled={resendIn > 0 || resending || verify.isPending}
          loading={resending}
          loadingText="Sending…"
          onClick={() => onResend()}
        >
          {resendIn > 0
            ? `Send a new code in ${mmss(resendIn)}`
            : 'Send a new code'}
        </Button>
        <Button
          {...textButton}
          color="gray.300"
          _hover={{ color: 'gray.500' }}
          disabled={verify.isPending}
          onClick={() => onRestart()}
        >
          Use a different account
        </Button>
      </Flex>
    </Box>
  );
}
