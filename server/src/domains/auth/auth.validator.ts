import { z } from "zod";

export const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
    appVersion: z.string().optional(),
  }),
};

export const registerSchema = {
  body: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
    appVersion: z.string().optional(),
  }),
};

export const oauthSchema = {
  body: z.object({
    accessToken: z.string().min(1, "Access token is required"),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
    appVersion: z.string().optional(),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};
