import type { User, UserSettings } from "../../../generated/prisma";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  settings: UserSettings | null;
  createdAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  appVersion?: string;
}

export interface RegisterInput extends LoginInput {
  username: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export function toAuthUser(user: User & { settings?: UserSettings | null }): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isVerified: user.isVerified,
    settings: user.settings ?? null,
    createdAt: user.createdAt,
  };
}
