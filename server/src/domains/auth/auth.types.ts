import type { User, UserSettings, SubscriptionTier } from "../../../generated/prisma";

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
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry: Date | null;
  trialStartDate: Date | null;
  effectiveTier: "FREE" | "TRIAL" | "PRO";
  trialDaysLeft: number;
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

export interface OAuthInput {
  accessToken: string;
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  appVersion?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export function toAuthUser(user: User & { settings?: UserSettings | null }): AuthUser {
  const now = new Date();

  const trialDaysLeft = user.trialStartDate
    ? Math.max(0, 7 - Math.floor((now.getTime() - user.trialStartDate.getTime()) / 86400000))
    : 0;

  const isExpired = user.subscriptionExpiry ? user.subscriptionExpiry < now : true;
  const isOnTrial = user.subscriptionTier === "FREE" && trialDaysLeft > 0 && !isExpired;

  const effectiveTier: "FREE" | "TRIAL" | "PRO" = isExpired
    ? "FREE"
    : isOnTrial
      ? "TRIAL"
      : user.subscriptionTier === "PRO"
        ? "PRO"
        : "FREE";

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isVerified: user.isVerified,
    subscriptionTier: user.subscriptionTier,
    subscriptionExpiry: user.subscriptionExpiry,
    trialStartDate: user.trialStartDate,
    effectiveTier,
    trialDaysLeft,
    settings: user.settings ?? null,
    createdAt: user.createdAt,
  };
}
