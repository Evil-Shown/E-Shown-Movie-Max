import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    platform: z.string().optional(),
    browser: z.string().optional(),
    appVersion: z.string().optional(),
  }),
});

export const registerSchema = z.object({
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
});
