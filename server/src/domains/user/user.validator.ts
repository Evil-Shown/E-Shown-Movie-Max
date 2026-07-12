import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    displayName: z.string().max(50).optional(),
    bio: z.string().max(500).optional(),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    language: z.string().length(2).optional(),
    autoplay: z.boolean().optional(),
    preferredProvider: z.string().optional(),
    subtitleLang: z.string().optional(),
    quality: z.string().optional(),
    notifications: z.boolean().optional(),
  }),
});
