import AsyncStorage from "@react-native-async-storage/async-storage";
import { secureGetItem, secureSetItem, secureRemoveItem } from "./secure-store";
import type { WatchlistItem } from "./types";

const SECURE_KEY = "watchlist";
const FALLBACK_KEY = "chithra-watchlist-fallback";
const MAX_ITEMS = 100;
let writeChain: Promise<unknown> = Promise.resolve();
let useSecureCached: boolean | null = null;

function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeChain.then(fn, fn);
  writeChain = result.catch(() => undefined);
  return result;
}

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
      console.warn("[storage] SecureStore unavailable — watchlist data stored in AsyncStorage (unencrypted)");
    }
    return false;
  }
}

async function read(): Promise<WatchlistItem[]> {
  if (await canUseSecure()) {
    try {
      const raw = await secureGetItem(SECURE_KEY);
      if (raw) return JSON.parse(raw) as WatchlistItem[];
    } catch {
      // fall through
    }
  }

  try {
    const raw = await AsyncStorage.getItem(FALLBACK_KEY);
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
  } catch {
    return [];
  }
}

async function write(items: WatchlistItem[]): Promise<void> {
  const trimmed = items.slice(0, MAX_ITEMS);
  const data = JSON.stringify(trimmed);

  if (await canUseSecure()) {
    try {
      await secureSetItem(SECURE_KEY, data);
      await AsyncStorage.removeItem(FALLBACK_KEY);
      return;
    } catch {
      // fall through to AsyncStorage
    }
  }

  await AsyncStorage.setItem(FALLBACK_KEY, data);
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const items = await read();
  return items.sort((a, b) => b.addedAt - a.addedAt);
}

export async function isInWatchlist(id: string): Promise<boolean> {
  const items = await read();
  return items.some((item) => item.id === id);
}

export async function toggleWatchlistItem(item: WatchlistItem): Promise<"added" | "removed"> {
  return serialize(async () => {
    const items = await read();
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items.splice(index, 1);
      await write(items);
      return "removed";
    }
    await write([{ ...item, addedAt: Date.now() }, ...items]);
    return "added";
  });
}

export async function removeFromWatchlist(id: string): Promise<void> {
  return serialize(async () => {
    const items = await read();
    await write(items.filter((item) => item.id !== id));
  });
}
