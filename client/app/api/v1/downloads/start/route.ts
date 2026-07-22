import { enforceRateLimit } from "@/lib/cache/rate-limit";
import { resolveHlsMedia } from "@/lib/media/hls-resolver";
import { isHlsProvider, type StreamProvider } from "@/lib/providers";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const MAX_FILE_SIZE_MB = 500;
const CHUNK_LOG_INTERVAL = 30;

function getSafeFilename(tmdbId: string, season?: number, episode?: number): string {
  if (season && episode) {
    return `chithra-s${season.toString().padStart(2, "0")}e${episode.toString().padStart(2, "0")}-${tmdbId}.mp4`;
  }
  return `chithra-movie-${tmdbId}.mp4`;
}

function ffmpegExists(): boolean {
  return process.env.FFMPEG_PATH
    ? existsSync(process.env.FFMPEG_PATH)
    : existsSync("/usr/bin/ffmpeg") || existsSync("/usr/local/bin/ffmpeg");
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "downloads:start", 3, 300);
  if (limited) return limited;

  if (!ffmpegExists()) {
    return Response.json({ error: "ffmpeg is not available on this server" }, { status: 501 });
  }

  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type") ?? "movie";
  const seasonStr = searchParams.get("season");
  const episodeStr = searchParams.get("episode");
  const provider = (searchParams.get("provider") ?? "dynamic_hls") as StreamProvider;

  if (!tmdbId || !/^\d+$/.test(tmdbId)) {
    return Response.json({ error: "Valid numeric tmdbId is required" }, { status: 400 });
  }

  if (type !== "movie" && type !== "tv") {
    return Response.json({ error: "type must be movie or tv" }, { status: 400 });
  }

  if (!isHlsProvider(provider)) {
    return Response.json({ error: `Provider ${provider} does not support media download` }, { status: 400 });
  }

  const season = seasonStr ? parseInt(seasonStr, 10) : undefined;
  const episode = episodeStr ? parseInt(episodeStr, 10) : undefined;

  if (type === "tv" && (season === undefined || episode === undefined)) {
    return Response.json({ error: "TV downloads require season and episode" }, { status: 400 });
  }

  try {
    const candidate = await resolveHlsMedia({
      provider,
      tmdbId,
      type: type as "movie" | "tv",
      season,
      episode,
    });

    if (!candidate?.url) {
      return Response.json({ error: "No HLS stream available for this title" }, { status: 404 });
    }

    const proxyBase = new URL("/api/live-tv/stream", request.url).toString();
    const urlParams = new URLSearchParams({ url: candidate.url });
    if (candidate.referer) urlParams.set("referer", candidate.referer);
    if (candidate.origin) urlParams.set("origin", candidate.origin);
    const proxiedManifestUrl = `${proxyBase}?${urlParams.toString()}`;

    const filename = getSafeFilename(tmdbId, season, episode);
    const signal = request.signal;
    const ffmpegCmd = process.env.FFMPEG_PATH ?? "ffmpeg";

    const ffmpeg = spawn(ffmpegCmd, [
      "-loglevel",
      "warning",
      "-stats",
      "-user_agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "-i",
      proxiedManifestUrl,
      "-c",
      "copy",
      "-bsf:a",
      "aac_adtstoasc",
      "-movflags",
      "+faststart",
      "-f",
      "mp4",
      "pipe:1",
    ]);

    let totalBytes = 0;
    let killed = false;

    const stream = new ReadableStream({
      start(controller) {
        ffmpeg.stdout?.on("data", (chunk: Buffer) => {
          if (killed) return;
          totalBytes += chunk.length;
          if (totalBytes > MAX_FILE_SIZE_MB * 1024 * 1024) {
            killed = true;
            ffmpeg.kill();
            controller.error(new Error(`File exceeds ${MAX_FILE_SIZE_MB} MB limit`));
            return;
          }
          controller.enqueue(new Uint8Array(chunk));
        });

        ffmpeg.stdout?.on("end", () => {
          if (!killed) controller.close();
        });

        ffmpeg.stderr?.on("data", (data: Buffer) => {
          const msg = data.toString("utf-8").trim();
          if (!msg) return;
          if (totalBytes > 0 && totalBytes % (CHUNK_LOG_INTERVAL * 1024 * 1024) < 1024 * 64) {
            console.log(`[ffmpeg download] ${tmdbId}: ${msg}`);
          }
        });

        ffmpeg.on("error", (err) => {
          if (!killed) controller.error(err);
        });

        ffmpeg.on("close", (code) => {
          if (!killed && code !== 0) {
            controller.error(new Error(`ffmpeg exited with code ${code}`));
          }
        });

        signal?.addEventListener("abort", () => {
          killed = true;
          ffmpeg.kill();
        });
      },
      cancel() {
        killed = true;
        ffmpeg.kill();
      },
    });

    const platform = request.headers.get("x-client-platform");
    const isElectron = platform === "electron";

    return new Response(stream, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...(isElectron ? {} : { "X-Download-Limit": `Max ${MAX_FILE_SIZE_MB} MB on web. Use Desktop app for larger files.` }),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download preparation failed";
    console.error("API Error [/api/v1/downloads/start]:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
