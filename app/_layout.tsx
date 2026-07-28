import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppAlertProvider } from '@/components/AppAlertProvider';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppAlertProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="letter/[letter]" options={{ headerShown: false }} />
        </Stack>
      </AppAlertProvider>
    </SafeAreaProvider>
  );
}
