import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { FocusProvider } from '@/focus/FocusProvider'
import { SettingsProvider } from '@/focus/SettingsProvider'
import { color } from '@/theme'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SettingsProvider>
        <FocusProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: color.bg },
              headerTintColor: color.text,
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
              contentStyle: { backgroundColor: color.bg }
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="records" options={{ title: '집중 기록' }} />
            <Stack.Screen name="settings" options={{ title: '설정' }} />
          </Stack>
        </FocusProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  )
}
