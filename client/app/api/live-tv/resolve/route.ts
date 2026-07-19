import { resolveChannelStream } from "@/lib/live-tv/stream-resolver";
import { getChannelById } from "@/lib/live-tv/channels";

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

    const stream = await resolveChannelStream(channelId);

    if (!stream) {
      return Response.json({ error: "No stream available", channelId }, { status: 404 });
    }

    return Response.json(
      { channelId, stream },
      {
        headers: {
          "Cache-Control": "public, max-age=600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("API Error [/api/live-tv/resolve]:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
