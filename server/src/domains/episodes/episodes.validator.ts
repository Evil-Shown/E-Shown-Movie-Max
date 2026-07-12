import { z } from "zod";

export const markEpisodeSchema = z.object({
  body: z.object({
    tvdbId: z.string().min(1),
    season: z.number().int().min(1),
    episode: z.number().int().min(1),
  }),
});

export const getEpisodesSchema = z.object({
  query: z.object({
    tvdbId: z.string().min(1),
  }),
});
