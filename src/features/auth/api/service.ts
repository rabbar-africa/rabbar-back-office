import { axios } from '@/lib/axios';
import type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  RegisterPayload,
  RegisterResponse,
} from './types';
import { type ApiResponse } from '@/shared/interface/api';
import { type IUser } from '@/shared/interface/user';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post<{ data: LoginResponse }>(
      'back-office/auth/login',
      {
        email: credentials.email.trim(),
        password: credentials.password,
      }
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
