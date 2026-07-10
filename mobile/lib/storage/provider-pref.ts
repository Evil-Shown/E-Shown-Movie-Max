import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_STREAM_PROVIDER,
  STREAM_PROVIDERS,
  type StreamProvider,
} from '@chithra/core/providers';

const KEY = 'chithra-stream-provider';

export async function getPreferredProvider(): Promise<StreamProvider> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored && STREAM_PROVIDERS.includes(stored as StreamProvider)) {
      return stored as StreamProvider;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_STREAM_PROVIDER;
}

export async function setPreferredProvider(provider: StreamProvider): Promise<void> {
  await AsyncStorage.setItem(KEY, provider);
}
