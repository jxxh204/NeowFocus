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
          <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: color.bg } }} />
        </FocusProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  )
}
