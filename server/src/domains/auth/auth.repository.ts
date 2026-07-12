import { prisma } from "../../infrastructure/prisma";
import type { Role } from "../../../generated/prisma";

export async function findUserByAuthId(authUserId: string) {
  return prisma.user.findUnique({
    where: { authUserId },
    include: { settings: true },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { settings: true },
  });
}

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function createUser(data: {
  email: string;
  username: string;
  authUserId: string;
  isVerified?: boolean;
  role?: Role;
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      authUserId: data.authUserId,
      isVerified: data.isVerified ?? false,
      role: data.role ?? "USER",
      settings: {
        create: {},
      },
    },
    include: { settings: true },
  });
}
