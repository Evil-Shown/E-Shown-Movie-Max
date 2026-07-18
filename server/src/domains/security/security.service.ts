import axios from "axios";
import { env } from "../../config/env";
import { AppError } from "../../utils/response";

const REQUEST_TIMEOUT_MS = 8000;

function resolveVtKey(platform?: string): string | undefined {
  switch (platform) {
    case "web":
      return env.VIRUSTOTAL_API_KEY_WEB || env.VIRUSTOTAL_API_KEY;
    case "desktop":
      return env.VIRUSTOTAL_API_KEY_DESKTOP || env.VIRUSTOTAL_API_KEY;
    case "mobile":
      return env.VIRUSTOTAL_API_KEY_MOBILE || env.VIRUSTOTAL_API_KEY;
    default:
      return env.VIRUSTOTAL_API_KEY;
  }
}

export async function getVirusTotalReport(hash: string, platform?: string) {
  if (!hash || hash.length < 20) {
    throw new AppError(400, "INVALID_HASH", "Valid torrent hash is required.");
  }

  const apiKey = resolveVtKey(platform);

  if (!apiKey) {
    return {
      configured: false,
      error: "VirusTotal is not configured.",
    };
  }

  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/files/${encodeURIComponent(hash)}`, {
      headers: {
        "x-apikey": apiKey,
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    const stats = response.data?.data?.attributes?.last_analysis_stats || {};
    const malicious = Number(stats.malicious || 0);
    const suspicious = Number(stats.suspicious || 0);
    const harmless = Number(stats.harmless || 0);
    const undetected = Number(stats.undetected || 0);

    return {
      configured: true,
      hash,
      verdict: malicious > 0 || suspicious > 0 ? "risky" : "clean_or_unknown",
      stats: { malicious, suspicious, harmless, undetected },
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        configured: true,
        hash,
        verdict: "unknown",
        error: "No VirusTotal report found for this hash yet.",
      };
    }

    const message = error instanceof Error ? error.message : "Unknown VirusTotal error";
    throw new AppError(502, "VIRUSTOTAL_ERROR", "Could not fetch VirusTotal report right now.");
  }
}
