import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY_PREFIX = "chithra-secure-";
const MAX_SECURE_VALUE_LENGTH = 2048;

class SecureStoreUnavailableError extends Error {
  constructor(key: string) {
    super(`SecureStore unavailable. Cannot store sensitive key: ${key}`);
    this.name = "SecureStoreUnavailableError";
  }
}

async function isAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  const available = await isAvailable();
  if (!available) {
    throw new SecureStoreUnavailableError(key);
  }
  if (value.length > MAX_SECURE_VALUE_LENGTH) {
    throw new Error(`Value for key "${key}" exceeds SecureStore size limit of ${MAX_SECURE_VALUE_LENGTH} bytes`);
  }
  await SecureStore.setItemAsync(`${STORAGE_KEY_PREFIX}${key}`, value);
}

export async function secureGetItem(key: string): Promise<string | null> {
  const available = await isAvailable();
  if (!available) {
    throw new SecureStoreUnavailableError(key);
  }
  return SecureStore.getItemAsync(`${STORAGE_KEY_PREFIX}${key}`);
}

export async function secureRemoveItem(key: string): Promise<void> {
  const available = await isAvailable();
  if (!available) return;
  await SecureStore.deleteItemAsync(`${STORAGE_KEY_PREFIX}${key}`);
}
