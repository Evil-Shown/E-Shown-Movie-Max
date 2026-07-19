import { LIVE_TV_CATEGORY_LABELS, LIVE_TV_CHANNELS } from "@/lib/live-tv/channels";

export async function GET() {
  try {
    const channels = LIVE_TV_CHANNELS.map(
      ({ id, name, category, region, isHd, isFeatured, logo, logoColor, logoInitials, description }) => ({
        id,
        name,
        category,
        region,
        isHd,
        isFeatured,
        logo,
        logoColor,
        logoInitials,
        description,
      })
    );

    return Response.json(
      { channels, categoryLabels: LIVE_TV_CATEGORY_LABELS },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("API Error [/api/live-tv/channels]:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
