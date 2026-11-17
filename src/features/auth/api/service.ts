import { axios } from '@/lib/axios';
import type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterPayload,
  RegisterResponse,
  SignInChallenge,
  VerifySignInPayload,
} from './types';
import { type ApiResponse } from '@/shared/interface/api';
import { type IUser } from '@/shared/interface/user';

export const authService = {
  /**
   * Sign-in step 1: email and password. Issues no tokens: the API emails a
   * 6-digit code and returns the challenge to check it against.
   */
  login: async (credentials: LoginCredentials): Promise<SignInChallenge> => {
    const response = await axios.post<{ data: SignInChallenge }>(
      'back-office/auth/login',
      {
        email: credentials.email.trim(),
        password: credentials.password,
      }
    );
    return response.data.data;
  },

  /** Sign-in step 2: the emailed code → the session. */
  verifySignIn: async (
    payload: VerifySignInPayload
  ): Promise<LoginResponse> => {
    const response = await axios.post<{ data: LoginResponse }>(
      'back-office/auth/verify',
      { challengeId: payload.challengeId, code: payload.code.trim() }
    );
    return response.data.data;
  },

  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await axios.post<{ data: RegisterResponse }>(
      'back-office/auth/register',
      payload
    );
    return response.data.data;
  },

  verifyEmail: async (code: string): Promise<IUser> => {
    const response = await axios.post<{ data: IUser }>(
      'back-office/auth/verify-email',
      { code }
    );
    return response.data.data;
  },

  resendVerification: async (): Promise<void> => {
    await axios.post('back-office/auth/resend-verification');
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axios.post<{ data: LoginResponse }>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get<ApiResponse<IUser>>('/auth/me');
    return response.data.data;
  },

  /**
   * Emails a 6-digit reset code. The API answers the same whether or not the
   * email has an account, so this never says which emails exist.
   */
  forgotPassword: async (email: string): Promise<void> => {
    await axios.post('/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    });
  },

  /**
   * Sets a new password with the emailed code. Every session of the account
   * ends; the admin then signs in as usual (password, then a sign-in code).
   */
  resetPassword: async (payload: {
    email: string;
    otp: string;
    password: string;
  }): Promise<void> => {
    await axios.post('/auth/reset-password', {
      email: payload.email.trim().toLowerCase(),
      otp: payload.otp.trim(),
      password: payload.password,
    });
  },

  /** Ends every session of this account, this one included. */
  logoutAll: async () => {
    const response =
      await axios.post<ApiResponse<{ signedOut: true }>>('/auth/logout-all');
    return response.data.data;
  },
};
