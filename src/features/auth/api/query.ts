import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from './service';
import { leaveToSignIn, signOut } from '@/utils/session';
import type {
  LoginCredentials,
  RegisterPayload,
  VerifySignInPayload,
} from './types';
import { setAccessToken, setRefreshToken } from '@/utils/persistToken';
import { toaster } from '@/components/ui';
import { RouteConstants } from '@/shared/constants/routes';

/** Sign-in step 1: checks the password and emails a code. No tokens yet. */
export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
  });
}

/** Sign-in step 2: the emailed code signs the admin in. */
export function useVerifySignInMutation() {
  return useMutation({
    mutationFn: (payload: VerifySignInPayload) =>
      authService.verifySignIn(payload),
    // The code screen shows what went wrong beside the code.
    meta: { skipErrorToast: true },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      window.location.replace(RouteConstants.overview.base.path);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      // Persist tokens so the optional bank/address steps can call the
      // authenticated /organizations/me/* endpoints.
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    },
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (code: string) => authService.verifyEmail(code),
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: () => authService.resendVerification(),
    onSuccess: () => {
      toaster.create({
        type: 'success',
        description: 'A new verification code has been sent to your email',
      });
    },
  });
}

export function useGetCurrentUserQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: () => authService.getCurrentUser(),
    enabled: options?.enabled ?? true,
    retry: false,
  });
}

/** Log out of this device: the API ends the session, then the browser. */
export function useLogout() {
  return () => void signOut();
}

/**
 * Sign out of all devices: every session ends, this one too, so the browser
 * is cleared and sign-in opens. Failures toast globally and keep them in.
 */
export const useLogoutAllMutation = () =>
  useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => leaveToSignIn(),
  });
