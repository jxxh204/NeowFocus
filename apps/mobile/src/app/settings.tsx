import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import Constants from 'expo-constants'
import { DurationChips } from '@/components/DurationChips'
import { useSettings } from '@/focus/SettingsProvider'
import { color } from '@/theme'

export default function SettingsScreen() {
  const { settings, update } = useSettings()

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>기본 집중 시간</Text>
      <DurationChips
        value={settings.defaultMinutes}
        onChange={(defaultMinutes) => update({ defaultMinutes })}
      />

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>완료 알림·진동</Text>
          <Text style={styles.rowHint}>시간이 끝나면 알려드려요. 폰을 내려놔도 괜찮아요.</Text>
        </View>
        <Switch
          value={settings.alerts}
          onValueChange={(alerts) => update({ alerts })}
          accessibilityLabel="완료 알림·진동"
          trackColor={{ true: color.timer, false: color.line }}
          thumbColor={settings.alerts ? color.bg : color.cat}
        />
      </View>

      <Text style={styles.version}>버전 {Constants.expoConfig?.version}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 12 },
  sectionTitle: { color: color.muted, fontSize: 14, marginBottom: 2 },
  row: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.line
  },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { color: color.text, fontSize: 16 },
  rowHint: { color: color.muted, fontSize: 13, lineHeight: 18 },
  version: { marginTop: 32, color: color.muted, fontSize: 13 }
})
