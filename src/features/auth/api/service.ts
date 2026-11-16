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
};
