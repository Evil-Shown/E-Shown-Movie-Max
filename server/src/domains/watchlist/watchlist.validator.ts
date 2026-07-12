import { z } from "zod";

export const addWatchlistSchema = z.object({
  body: z.object({
    tmdbId: z.string().min(1),
    mediaType: z.enum(["movie", "tv"]),
    title: z.string().min(1),
    posterPath: z.string().optional(),
    year: z.number().int().optional(),
    rating: z.number().optional(),
    genres: z.string().optional(),
  }),
});

export const removeWatchlistSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
