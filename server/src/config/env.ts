import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

function notEmptyOrPlaceholder(msg: string) {
  return z
    .string()
    .min(1, msg)
    .refine((val) => !/^(your_|YOUR_|placeholder|changeme)/i.test(val), {
      message: `${msg} contains a placeholder value — set a real key`,
    });
}

const rawNodeEnv = z.enum(["development", "production", "test"]).default("development").parse(process.env.NODE_ENV);

const isProd = rawNodeEnv === "production";

const URL_OR_DEFAULT = (prodMsg: string, devDefault: string) =>
  isProd ? z.string().url(prodMsg) : z.string().url().default(devDefault);

const envSchema = z.object({
  NODE_ENV: z.literal(rawNodeEnv),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: notEmptyOrPlaceholder("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: notEmptyOrPlaceholder("SUPABASE_SERVICE_ROLE_KEY"),

  DATABASE_URL: notEmptyOrPlaceholder("DATABASE_URL"),

  TMDB_API_KEY: notEmptyOrPlaceholder("TMDB_API_KEY"),
  TMDB_API_KEY_WEB: z.string().optional(),
  TMDB_API_KEY_DESKTOP: z.string().optional(),
  TMDB_API_KEY_MOBILE: z.string().optional(),

  VIRUSTOTAL_API_KEY: z.string().optional(),
  VIRUSTOTAL_API_KEY_WEB: z.string().optional(),
  VIRUSTOTAL_API_KEY_DESKTOP: z.string().optional(),
  VIRUSTOTAL_API_KEY_MOBILE: z.string().optional(),

  OMDB_API_KEY: z.string().optional(),
  OMDB_API_KEY_WEB: z.string().optional(),
  OMDB_API_KEY_DESKTOP: z.string().optional(),
  OMDB_API_KEY_MOBILE: z.string().optional(),

  WYZIE_API_KEY: z.string().optional(),
  WYZIE_API_KEY_WEB: z.string().optional(),
  WYZIE_API_KEY_DESKTOP: z.string().optional(),
  WYZIE_API_KEY_MOBILE: z.string().optional(),

  CORS_ORIGIN: z.string().optional(),

  PAYHERE_MERCHANT_ID: z.string().optional().default(""),
  PAYHERE_SECRET: z.string().optional().default(""),
  PAYHERE_API_URL: URL_OR_DEFAULT(
    "PAYHERE_API_URL is required in production — set to https://payhere.lk",
    "https://sandbox.payhere.lk"
  ),

  APP_URL: URL_OR_DEFAULT("APP_URL is required in production — set to your frontend domain", "http://localhost:3000"),
  API_URL: URL_OR_DEFAULT("API_URL is required in production — set to your backend domain", "http://localhost:5000"),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  EMBED_PROXY_LIST: z.string().optional(),
  EMBED_CACHE_TTL_MS: z.coerce.number().int().positive().default(3600000),
  EMBED_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  EMBED_MAX_CACHE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),

  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),

  ADMIN_TELEMETRY_KEY: z.string().min(1, "ADMIN_TELEMETRY_KEY is required"),
  USER_DATA_PATH: z.string().optional(),

  GH_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse({
  ...process.env,
  NODE_ENV: rawNodeEnv,
});

if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
