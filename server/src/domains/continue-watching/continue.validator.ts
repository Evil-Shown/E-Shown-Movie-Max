import { z } from "zod";

export const upsertContinueSchema = z.object({
  body: z.object({
    tmdbId: z.string().min(1),
    mediaType: z.enum(["movie", "tv"]),
    title: z.string().min(1),
    posterPath: z.string().optional(),
    season: z.number().int().optional(),
    episode: z.number().int().optional(),
    currentTime: z.number().min(0).optional(),
    duration: z.number().min(0).optional(),
    progress: z.number().min(0).max(100).optional(),
    provider: z.string().optional(),
  }),
});

export const removeContinueSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
