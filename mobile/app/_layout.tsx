import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
} from '@expo-google-fonts/playfair-display';
import { Cinzel_600SemiBold } from '@expo-google-fonts/cinzel';
import { NotoSansSinhala_500Medium } from '@expo-google-fonts/noto-sans-sinhala';

import { colors } from '@/constants/theme';
import { UserLibraryProvider } from '@/components/providers/UserLibraryProvider';
import { VideoPlayerProvider } from '@/components/providers/VideoPlayerProvider';

// Keep the native splash screen visible until fonts are ready — avoids a
// flash of fallback system font before Playfair/Inter load in.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — matches the web app's catalog cache window
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    Cinzel_600SemiBold,
    NotoSansSinhala_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserLibraryProvider>
        <VideoPlayerProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bgPrimary },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="movie/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </VideoPlayerProvider>
      </UserLibraryProvider>
    </QueryClientProvider>
  );
}
