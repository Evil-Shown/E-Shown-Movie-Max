import AsyncStorage from "@react-native-async-storage/async-storage";
import { secureGetItem, secureSetItem, secureRemoveItem } from "./secure-store";
import type { ContinueWatchingItem } from "./types";

const SECURE_KEY = "continue-watching";
const FALLBACK_KEY = "chithra-continue-watching-fallback";
const MAX_ITEMS = 20;
let useSecureCached: boolean | null = null;

async function canUseSecure(): Promise<boolean> {
  if (useSecureCached !== null) return useSecureCached;
  try {
    await secureSetItem("__probe__", "1");
    await secureRemoveItem("__probe__");
    useSecureCached = true;
    return true;
  } catch {
    useSecureCached = false;
    if (__DEV__) {
      console.warn("[storage] SecureStore unavailable — continue-watching data stored in AsyncStorage (unencrypted)");
    }
    return false;
  }
}

async function read(): Promise<ContinueWatchingItem[]> {
  if (await canUseSecure()) {
    try {
      const raw = await secureGetItem(SECURE_KEY);
      if (raw) return JSON.parse(raw) as ContinueWatchingItem[];
    } catch {
      // fall through
    }
  }

  try {
    const raw = await AsyncStorage.getItem(FALLBACK_KEY);
    return raw ? (JSON.parse(raw) as ContinueWatchingItem[]) : [];
  } catch {
    return [];
  }
}

async function write(items: ContinueWatchingItem[]): Promise<void> {
  const trimmed = items.slice(0, MAX_ITEMS);
  const data = JSON.stringify(trimmed);

  if (await canUseSecure()) {
    try {
      await secureSetItem(SECURE_KEY, data);
      await AsyncStorage.removeItem(FALLBACK_KEY);
      return;
    } catch {
      // fall through
    }
  }

  await AsyncStorage.setItem(FALLBACK_KEY, data);
}

export async function getContinueWatching(): Promise<ContinueWatchingItem[]> {
  const items = await read();
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertContinueWatching(item: ContinueWatchingItem): Promise<void> {
  const items = await read();
  const filtered = items.filter((i) => i.id !== item.id);
  await write([{ ...item, updatedAt: Date.now() }, ...filtered]);
}

export async function removeFromContinueWatching(id: string): Promise<void> {
  const items = await read();
  await write(items.filter((item) => item.id !== id));
}

export async function getContinueItem(id: string): Promise<ContinueWatchingItem | undefined> {
  const items = await read();
  return items.find((item) => item.id === id);
}
