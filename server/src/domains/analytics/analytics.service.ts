import { prisma } from "../../infrastructure/prisma";
import { sanitizeQuery } from "../search/search.service";

const analytics = {
  streamed: new Map<string, number>(),
  downloaded: new Map<string, number>(),
};

function incrementAnalytics(map: Map<string, number>, key: string): void {
  if (!key) return;
  const normalized = key.toLowerCase();
  map.set(normalized, (map.get(normalized) || 0) + 1);
}

function getTopAnalytics(map: Map<string, number>, limit = 10): Array<{ query: string; count: number }> {
  return [...map.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function trackStream(query: string, userId?: string, sessionId?: string) {
  const normalized = sanitizeQuery(query);
  incrementAnalytics(analytics.streamed, normalized);

  if (userId) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId,
          event: "movie_started",
          properties: { query: normalized },
          sessionId,
        },
      });
    } catch (error) {
      // Silent fail for analytics
    }
  }
}

export async function trackDownload(query: string, userId?: string, sessionId?: string) {
  const normalized = sanitizeQuery(query);
  incrementAnalytics(analytics.downloaded, normalized);

  if (userId) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId,
          event: "download_started",
          properties: { query: normalized },
          sessionId,
        },
      });
    } catch (error) {
      // Silent fail for analytics
    }
  }
}

export function getSummary() {
  return {
    mostStreamed: getTopAnalytics(analytics.streamed, 10),
    mostDownloaded: getTopAnalytics(analytics.downloaded, 10),
  };
}
