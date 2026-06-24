import { NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "sub.wyzie.io",
  "dl.opensubtitles.org",
  "www.opensubtitles.org",
  "opensubtitles.org",
  "githubusercontent.com",
  "raw.githubusercontent.com",
];

function isAllowedSubtitleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

/** Proxy subtitle files so embed players can load them without CORS issues. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");
  const translateTo = searchParams.get("translateTo");

  if (!target || !isAllowedSubtitleUrl(target)) {
    return NextResponse.json({ error: "Invalid subtitle URL" }, { status: 400 });
  }

  try {
    const response = await fetch(target, {
      headers: { Accept: "text/vtt,text/plain,*/*" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Subtitle file unavailable" }, { status: response.status });
    }

    const body = await response.text();

    if (translateTo) {
      const translationApiUrl = process.env.SUBTITLE_TRANSLATE_API_URL;
      if (translationApiUrl) {
        const translated = await fetch(translationApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: body, target: translateTo }),
        });

        if (translated.ok) {
          const translatedText = await translated.text();
          return new NextResponse(translatedText, {
            headers: {
              "Content-Type": "text/vtt; charset=utf-8",
              "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            },
          });
        }
      }
    }

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch subtitle file" }, { status: 502 });
  }
}
