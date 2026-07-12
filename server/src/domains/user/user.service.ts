import { AppError } from "../../utils/response";
import { logger } from "../../config/logger";
import { prisma } from "../../infrastructure/prisma";
import * as userRepository from "./user.repository";
import type { UpdateProfileInput, UpdatePreferencesInput, UserProfileResponse } from "./user.types";

function toProfileResponse(user: Awaited<ReturnType<typeof userRepository.findUserById>>): UserProfileResponse {
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isVerified: user.isVerified,
    settings: user.settings ?? null,
    createdAt: user.createdAt,
  };
}

async function createAuditLog(userId: string, action: string, metadata?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, metadata },
    });
  } catch (error) {
    logger.warn({ error, userId, action }, "Failed to create audit log");
  }
}

export async function getProfile(userId: string): Promise<UserProfileResponse> {
  const user = await userRepository.findUserById(userId);
  return toProfileResponse(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfileResponse> {
  const user = await userRepository.updateProfile(userId, input);
  await createAuditLog(userId, "PROFILE_UPDATED", input);
  return toProfileResponse(user);
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<UserProfileResponse> {
  if (!avatarUrl) {
    throw new AppError(400, "MISSING_AVATAR", "No avatar URL provided");
  }

  const user = await userRepository.updateAvatar(userId, avatarUrl);
  await createAuditLog(userId, "AVATAR_UPDATED", { avatarUrl });
  return toProfileResponse(user);
}

export async function updatePreferences(userId: string, input: UpdatePreferencesInput): Promise<UserProfileResponse> {
  await userRepository.upsertSettings(userId, input);
  const user = await userRepository.findUserById(userId);
  await createAuditLog(userId, "PREFERENCES_UPDATED", input);
  return toProfileResponse(user);
}
