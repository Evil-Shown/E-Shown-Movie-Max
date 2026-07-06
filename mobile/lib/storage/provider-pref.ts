import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StreamProvider } from '../providers';

const KEY = 'chithra-stream-provider';

export async function getPreferredProvider(): Promise<StreamProvider> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (
      stored === 'vidsrc' ||
      stored === 'vidlink' ||
      stored === 'superembed' ||
      stored === 'embedsu'
    ) {
      return stored;
    }
  } catch {
    // fall through to default
  }
  return 'vidsrc';
}

export async function setPreferredProvider(provider: StreamProvider): Promise<void> {
  await AsyncStorage.setItem(KEY, provider);
}
