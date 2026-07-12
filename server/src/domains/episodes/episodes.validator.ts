import { z } from "zod";

export const markEpisodeSchema = {
  body: z.object({
    tvdbId: z.string().min(1),
    season: z.number().int().min(1),
    episode: z.number().int().min(1),
  }),
};

export const getEpisodesSchema = {
  query: z.object({
    tvdbId: z.string().min(1),
  }),
};
