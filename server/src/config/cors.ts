import type { CorsOptions } from "cors";
import { env } from "./env";

const allowedOrigins: string[] = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://localhost:19006",
  "https://chithra-cinema.vercel.app",
  "https://chithracinema.vercel.app",
];

if (env.CORS_ORIGIN) {
  for (const origin of env.CORS_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    allowedOrigins.push(origin);
  }
}

if (env.APP_URL) {
  allowedOrigins.push(env.APP_URL);
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Platform", "x-platform"],
};
