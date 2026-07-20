/**
 * k6 Load Test — CHITHRA Cinema (Deployed Endpoints)
 *
 * Tests the currently deployed TMDB proxy + health endpoints.
 * Update the endpoints below after deploying the BFF code.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const latency = new Trend("req_latency", true);

const BASE_URL = __ENV.BASE_URL || "https://chithra-cinema-api.onrender.com";

// Existing deployed TMDB proxy endpoints
const ENDPOINTS = [
  "/health",
  "/api/v1/tmdb/movie/popular",
  "/api/v1/tmdb/movie/now_playing",
  "/api/v1/tmdb/movie/top_rated",
  "/api/v1/tmdb/trending/all/day",
  "/api/v1/tmdb/movie/27205",      // Inception
  "/api/v1/tmdb/movie/157336",     // Interstellar
  "/api/v1/tmdb/movie/155",        // The Dark Knight
];

export const options = {
  stages: [
    { duration: "15s", target: 50 },   // Ramp up
    { duration: "30s", target: 200 },  // Stay at 200
    { duration: "15s", target: 500 },  // Spike to 500
    { duration: "1m", target: 500 },   // Hold at 500
    { duration: "15s", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    errors: ["rate<0.10"],
  },
};

export default function () {
  const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, {
    tags: { endpoint: endpoint },
  });

  const success = check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 2s": (r) => r.timings.duration < 2000,
    "has content": (r) => r.body && r.body.length > 10,
  });

  errorRate.add(!success);
  latency.add(res.timings.duration);

  sleep(Math.random() * 1.5 + 0.5);
}

export function setup() {
  console.log(`\n🚀 Load test: ${BASE_URL}`);
  const res = http.get(`${BASE_URL}/health`);
  if (res.status !== 200) {
    throw new Error(`Server unreachable: ${res.status}`);
  }
  console.log("✅ Server healthy. Starting test...\n");
}

export function teardown() {
  console.log("\n✅ Load test complete.");
}
