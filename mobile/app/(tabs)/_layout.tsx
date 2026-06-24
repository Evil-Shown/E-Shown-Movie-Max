import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
