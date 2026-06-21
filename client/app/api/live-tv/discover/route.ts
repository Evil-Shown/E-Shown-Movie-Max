import { getChannelById } from "@/lib/live-tv/channels";
import { resolveChannelStream } from "@/lib/live-tv/stream-resolver";
import {
  getProviderStreamCandidates,
  scrapeChannelStreams,
} from "@/lib/live-tv/stream-scraper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("id");

  if (!channelId) {
    return Response.json({ error: "Missing channel id" }, { status: 400 });
  }

  const channel = getChannelById(channelId);
  if (!channel) {
    return Response.json({ error: "Channel not found" }, { status: 404 });
  }

  const [stream, scraped, providerCandidates] = await Promise.all([
    resolveChannelStream(channelId),
    scrapeChannelStreams(channelId),
    Promise.resolve(getProviderStreamCandidates(channelId)),
  ]);

  return Response.json(
    {
      channelId,
      channelName: channel.name,
      stream,
      providerCandidates,
      scrapedUrls: scraped,
    },
    {
      headers: { "Cache-Control": "public, max-age=120" },
    }
  );
}
