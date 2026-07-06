import { removeNextCache } from "./ensure-dev-cache.mjs";

if (removeNextCache()) {
  console.log("[chithra] Removed .next cache.");
} else {
  console.log("[chithra] No .next cache to remove.");
}
