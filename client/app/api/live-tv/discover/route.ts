import { getChannelById } from "@/lib/live-tv/channels";
import { isBrowserScraperEnabled } from "@/lib/live-tv/stream-browser-scraper";
import { isHeaderRotationEnabled } from "@/lib/live-tv/stream-headers";
import { resolveChannelStream } from "@/lib/live-tv/stream-resolver";
import {
  getProviderStreamCandidates,
  getScrapeTargets,
  scrapeChannelStreams,
  scrapePeotvApis,
} from "@/lib/live-tv/stream-scraper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("id");

    if (!channelId) {
      return Response.json({ error: "Missing channel id" }, { status: 400 });
    }

    const channel = getChannelById(channelId);
    if (!channel) {
      return Response.json({ error: "Channel not found" }, { status: 404 });
    }

    const [stream, scraped, providerCandidates, apiUrls] = await Promise.all([
      resolveChannelStream(channelId),
      scrapeChannelStreams(channelId),
      Promise.resolve(getProviderStreamCandidates(channelId)),
      scrapePeotvApis(channelId),
    ]);

    return Response.json(
      {
        channelId,
        channelName: channel.name,
        stream,
        providerCandidates,
        scrapedUrls: scraped,
        peotvApiUrls: apiUrls,
        scrapeTargets: getScrapeTargets(channelId).map((t) => t.pageUrl),
        browserScraperEnabled: isBrowserScraperEnabled(),
        headerRotationEnabled: isHeaderRotationEnabled(),
      },
      {
        headers: { "Cache-Control": "public, max-age=120" },
      }
    );
  } catch (error) {
    console.error("API Error [/api/live-tv/discover]:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
