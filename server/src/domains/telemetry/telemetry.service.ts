import fs from "fs";
import path from "path";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

type TelemetryClient = {
  firstSeen?: string;
  version?: string;
  platform?: string;
  lastSeen?: string;
};

const telemetryFile = path.join(env.USER_DATA_PATH || process.cwd(), "telemetry.json");
const telemetryClients = new Map<string, TelemetryClient>();

function loadTelemetry(): void {
  try {
    if (fs.existsSync(telemetryFile)) {
      const data = JSON.parse(fs.readFileSync(telemetryFile, "utf8")) as Record<string, TelemetryClient>;
      for (const [clientId, info] of Object.entries(data)) {
        telemetryClients.set(clientId, info);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown telemetry load error";
    logger.error("Failed to load telemetry: %s", message);
  }
}

function saveTelemetry(): void {
  try {
    const data = Object.fromEntries(telemetryClients);
    fs.writeFileSync(telemetryFile, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown telemetry save error";
    logger.error("Failed to save telemetry: %s", message);
  }
}

loadTelemetry();

export function ping(clientId: string, version?: string, platform?: string): void {
  const now = new Date().toISOString();
  const existing = telemetryClients.get(clientId) || { firstSeen: now };

  telemetryClients.set(clientId, {
    ...existing,
    version: version || "unknown",
    platform: platform || "unknown",
    lastSeen: now,
  });

  saveTelemetry();
}

export function heartbeat(clientId: string): void {
  const existing = telemetryClients.get(clientId);
  if (existing) {
    existing.lastSeen = new Date().toISOString();
    telemetryClients.set(clientId, existing);
    saveTelemetry();
  }
}

export function getStats(providedSecret: string | string[] | undefined) {
  const adminSecret = env.ADMIN_TELEMETRY_KEY || "chithra-telemetry-secret-1029";

  if (providedSecret !== adminSecret) {
    throw new Error("Unauthorized access to telemetry statistics.");
  }

  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  let totalClients = 0;
  let onlineNow = 0;
  const versionBreakdown: Record<string, number> = {};
  const platformBreakdown: Record<string, number> = {};

  for (const info of telemetryClients.values()) {
    const lastSeenTime = info.lastSeen ? new Date(info.lastSeen).getTime() : 0;

    if (lastSeenTime >= thirtyDaysAgo) {
      totalClients++;

      const isOnline = lastSeenTime >= fiveMinutesAgo;
      if (isOnline) {
        onlineNow++;
      }

      const version = info.version || "unknown";
      versionBreakdown[version] = (versionBreakdown[version] || 0) + 1;

      const platform = info.platform || "unknown";
      platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
    }
  }

  return {
    totalClients,
    onlineNow,
    offlineCount: Math.max(0, totalClients - onlineNow),
    versionBreakdown,
    platformBreakdown,
  };
}
