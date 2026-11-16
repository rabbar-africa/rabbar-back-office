export interface LoginCredentials {
  email: string;
  password: string;
}

/** POST back-office/auth/login: a code was emailed; no tokens yet. */
export interface SignInChallenge {
  challengeId: string;
  /** ISO time the code stops working (10 minutes after it was sent). */
  expiresAt: string;
  /** Masked address the code went to, e.g. "a***@rabbar.africa". */
  sentTo: string;
}

export interface VerifySignInPayload {
  challengeId: string;
  code: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  organizationId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  website?: string;
  taxId?: string;
  timezone?: string;
  currency?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerPhone?: string;
}

export type RegisterResponse = LoginResponse;
