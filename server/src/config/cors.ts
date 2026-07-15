import type { CorsOptions } from "cors";
import { env } from "./env";

const allowedOrigins = ["http://127.0.0.1:3000", "http://localhost:3000", "http://localhost:19006"];

if (env.NODE_ENV === "production") {
  // Add production origins here
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
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-secret"],
};
