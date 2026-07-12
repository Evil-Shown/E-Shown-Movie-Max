import axios from "axios";
import { env } from "../../config/env";
import { AppError } from "../../utils/response";

const REQUEST_TIMEOUT_MS = 8000;

export async function getVirusTotalReport(hash: string) {
  if (!hash || hash.length < 20) {
    throw new AppError(400, "INVALID_HASH", "Valid torrent hash is required.");
  }

  if (!env.VIRUSTOTAL_API_KEY) {
    return {
      configured: false,
      error: "VirusTotal is not configured.",
    };
  }

  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/files/${encodeURIComponent(hash)}`, {
      headers: {
        "x-apikey": env.VIRUSTOTAL_API_KEY,
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
