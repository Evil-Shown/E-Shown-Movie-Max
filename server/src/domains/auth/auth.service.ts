import { supabaseAdmin, supabaseAnon } from "../../infrastructure/supabase";
import { prisma } from "../../infrastructure/prisma";
import { AppError } from "../../utils/response";
import { logger } from "../../config/logger";
import { env } from "../../config/env";
import * as authRepository from "./auth.repository";
import type { RegisterInput, LoginInput, OAuthInput, AuthResponse, AuthUser } from "./auth.types";
import { toAuthUser } from "./auth.types";
import { setTrialStartDate } from "../subscription/subscription.service";

async function createAuditLog(userId: string, action: string, metadata?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: metadata as unknown as never,
      },
    });
  } catch (error) {
    logger.warn({ error, userId, action }, "Failed to create audit log");
  }
}

async function upsertDevice(
  userId: string,
  deviceInfo: {
    deviceId?: string;
    deviceName?: string;
    platform?: string;
    browser?: string;
    appVersion?: string;
    ip?: string;
  }
) {
  if (!deviceInfo.deviceId) return;

  try {
    await prisma.device.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId: deviceInfo.deviceId,
        },
      },
      update: {
        deviceName: deviceInfo.deviceName,
        platform: deviceInfo.platform,
        browser: deviceInfo.browser,
        appVersion: deviceInfo.appVersion,
        lastActive: new Date(),
        lastIp: deviceInfo.ip,
      },
      create: {
        userId,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        platform: deviceInfo.platform,
        browser: deviceInfo.browser,
        appVersion: deviceInfo.appVersion,
        lastIp: deviceInfo.ip,
      },
    });
  } catch (error) {
    logger.warn({ error, userId, deviceId: deviceInfo.deviceId }, "Failed to upsert device");
  }
}

function mapSupabaseSession(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
}) {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? Date.now() / 1000 + (session.expires_in ?? 3600),
    expiresIn: session.expires_in ?? 3600,
  };
}

export async function register(input: RegisterInput, ip?: string): Promise<AuthResponse> {
  const { email, password, username } = input;

  const existingEmail = await authRepository.findUserByEmail(email);
  if (existingEmail) {
    throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists");
  }

  const existingUsername = await authRepository.findUserByUsername(username);
  if (existingUsername) {
    throw new AppError(409, "USERNAME_EXISTS", "This username is already taken");
  }

  const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: env.NODE_ENV === "development", // Auto-verify in dev
    user_metadata: { username },
  });

  if (createError || !authData.user) {
    logger.error({ error: createError, email }, "Supabase createUser failed");
    throw new AppError(500, "AUTH_PROVIDER_ERROR", "Failed to create account");
  }

  try {
    const localUser = await authRepository.createUser({
      email,
      username,
      authUserId: authData.user.id,
      isVerified: env.NODE_ENV === "development",
    });

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      logger.error({ error: signInError, email }, "Auto-login after registration failed");
      throw new AppError(500, "AUTH_PROVIDER_ERROR", "Account created but login failed");
    }

    await upsertDevice(localUser.id, {
      deviceId: input.deviceId,
      deviceName: input.deviceName,
      platform: input.platform,
      browser: input.browser,
      appVersion: input.appVersion,
      ip,
    });

    await createAuditLog(localUser.id, "REGISTER", { email, ip });
    await setTrialStartDate(localUser.id);

    return {
      user: toAuthUser(localUser),
      tokens: mapSupabaseSession(signInData.session),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ error, email, authUserId: authData.user.id }, "Local user creation failed");
    throw new AppError(500, "USER_CREATION_FAILED", "Failed to complete registration");
  }
}

export async function login(input: LoginInput, ip?: string): Promise<AuthResponse> {
  const { email, password } = input;

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const localUser = await authRepository.findUserByAuthId(data.user.id);
  if (!localUser) {
    logger.error({ authUserId: data.user.id, email }, "Logged-in Supabase user missing local record");
    throw new AppError(500, "USER_NOT_FOUND", "User account not found");
  }

  await upsertDevice(localUser.id, {
    deviceId: input.deviceId,
    deviceName: input.deviceName,
    platform: input.platform,
    browser: input.browser,
    appVersion: input.appVersion,
    ip,
  });

  await createAuditLog(localUser.id, "LOGIN", { email, ip });

  return {
    user: toAuthUser(localUser),
    tokens: mapSupabaseSession(data.session),
  };
}

export async function logout(authUserId?: string): Promise<void> {
  if (!authUserId) return;

  try {
    const { error } = await supabaseAdmin.auth.admin.signOut(authUserId, "global");
    if (error) {
      logger.warn({ error, authUserId }, "Supabase admin signOut failed");
    }
  } catch (error) {
    logger.warn({ error, authUserId }, "Supabase admin signOut threw");
  }
}

export async function oauth(input: OAuthInput, ip?: string): Promise<AuthResponse> {
  const { accessToken } = input;

  const { data, error } = await supabaseAnon.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new AppError(401, "INVALID_TOKEN", "Invalid or expired access token");
  }

  const supabaseUser = data.user;
  const email = supabaseUser.email;
  const username =
    supabaseUser.user_metadata?.username || supabaseUser.email?.split("@")[0] || `user_${supabaseUser.id.slice(0, 8)}`;
  const avatarUrl = supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null;

  let localUser = await authRepository.findUserByAuthId(supabaseUser.id);

  if (!localUser) {
    if (email) {
      const existingByEmail = await authRepository.findUserByEmail(email);
      if (existingByEmail) {
        throw new AppError(
          409,
          "EMAIL_EXISTS",
          "An account with this email already exists. Try logging in with your password."
        );
      }
    }

    let finalUsername = username;
    let attempt = 0;
    while (await authRepository.findUserByUsername(finalUsername)) {
      attempt++;
      finalUsername = `${username}_${attempt}`;
    }

    localUser = await authRepository.createUser({
      email: email || `${supabaseUser.id}@oauth.chithra`,
      username: finalUsername,
      authUserId: supabaseUser.id,
      isVerified: true,
    });

    await setTrialStartDate(localUser.id);

    if (avatarUrl) {
      await prisma.user
        .update({
          where: { id: localUser.id },
          data: { avatarUrl },
        })
        .catch(() => {});
    }
  }

  await upsertDevice(localUser.id, {
    deviceId: input.deviceId,
    deviceName: input.deviceName,
    platform: input.platform,
    browser: input.browser,
    appVersion: input.appVersion,
    ip,
  });

  await createAuditLog(localUser.id, "OAUTH_LOGIN", { email, provider: "google", ip });

  return {
    user: toAuthUser(localUser),
    tokens: {
      accessToken,
      refreshToken: "",
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      expiresIn: 3600,
    },
  };
}

export function getMe(user: AuthUser): AuthUser {
  return user;
}
