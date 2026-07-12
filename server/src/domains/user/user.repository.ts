import { prisma } from "../../infrastructure/prisma";

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { settings: true },
  });
}

export async function updateProfile(userId: string, data: { displayName?: string; bio?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      displayName: data.displayName,
      bio: data.bio,
    },
    include: { settings: true },
  });
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    include: { settings: true },
  });
}

export async function upsertSettings(
  userId: string,
  data: Partial<{
    language: string;
    autoplay: boolean;
    preferredProvider: string;
    subtitleLang: string;
    quality: string;
    notifications: boolean;
  }>
) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}
