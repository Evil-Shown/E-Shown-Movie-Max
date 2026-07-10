import { batchLoadExternalRatings, type ExternalRatingsItem } from "@/lib/external-ratings";
import { NextResponse } from "next/server";

const MAX_ITEMS = 30;

export async function POST(request: Request) {
  let body: { items?: ExternalRatingsItem[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
  if (items.length === 0) {
    return NextResponse.json(
      { ratings: {} },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  const normalized = items
    .filter((item) => item?.id && item?.title)
    .map((item) => ({
      id: String(item.id),
      title: String(item.title).trim(),
      year: typeof item.year === "number" && item.year > 0 ? item.year : undefined,
      imdbId: item.imdbId ? String(item.imdbId) : undefined,
    }));

  try {
    const ratings = await batchLoadExternalRatings(normalized);
    return NextResponse.json(
      { ratings },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { ratings: {} },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        },
      }
    );
  }
}
