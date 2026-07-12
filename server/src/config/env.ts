import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Database
  DATABASE_URL: z.string().min(1),

  // External APIs
  TMDB_API_KEY: z.string().min(1).optional(),
  VIRUSTOTAL_API_KEY: z.string().min(1).optional(),

  // Redis (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Embed proxy
  EMBED_PROXY_LIST: z.string().optional(),
  EMBED_CACHE_TTL_MS: z.string().default("3600000"),
  EMBED_REQUEST_TIMEOUT_MS: z.string().default("15000"),

  // Logging
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),

  // Admin telemetry
  ADMIN_TELEMETRY_KEY: z.string().optional(),
  USER_DATA_PATH: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
