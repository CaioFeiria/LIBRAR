import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Alfabeto em Libras' }} />
        <Stack.Screen name="letter/[letter]" options={{ title: 'Letra' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
