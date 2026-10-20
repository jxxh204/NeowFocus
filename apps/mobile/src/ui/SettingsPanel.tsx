import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import Constants from 'expo-constants'
import { DurationChips } from '@/components/DurationChips'
import { useSettings } from '@/focus/SettingsProvider'
import { IntegrationSettings } from '@/focus/IntegrationSettings'
import { color } from '@/theme'
import { PrivacyPanel, openSupport } from './PrivacyPanel'

export function SettingsPanel() {
  const { settings, update } = useSettings()
  const [privacyVisible, setPrivacyVisible] = useState(false)

  if (privacyVisible) return <PrivacyPanel onBack={() => setPrivacyVisible(false)} />

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>기본 집중 시간</Text>
      <DurationChips
        value={settings.defaultMinutes}
        onChange={(defaultMinutes) => update({ defaultMinutes })}
      />
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>완료 소리·진동</Text>
          <Text style={styles.rowHint}>이 iPhone에서 알려드려요. 무음·알림 설정을 따라요.</Text>
        </View>
        <Switch
          value={settings.alerts}
          onValueChange={(alerts) => update({ alerts })}
          accessibilityLabel="완료 소리·진동"
          trackColor={{ true: color.timer, false: color.switchOff }}
          ios_backgroundColor={color.switchOff}
          style={{ flexShrink: 0 }}
          thumbColor={settings.alerts ? color.bg : color.cat}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>집중 후 10분 휴식</Text>
          <Text style={styles.rowHint}>켜두면 집중을 마친 뒤 자동으로 쉬어요.</Text>
        </View>
        <Switch value={settings.autoBreak === true}
          onValueChange={(autoBreak) => update({ autoBreak })}
          accessibilityLabel="집중 후 10분 휴식"
          trackColor={{ true: color.timer, false: color.switchOff }}
          ios_backgroundColor={color.switchOff} style={{ flexShrink: 0 }}
          thumbColor={settings.autoBreak ? color.bg : color.cat} />
      </View>
      <IntegrationSettings />
      <View style={styles.links}>
        <Pressable accessibilityRole="button" onPress={() => setPrivacyVisible(true)} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
          <Text style={styles.linkText}>개인정보처리방침</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={openSupport} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
          <Text style={styles.linkText}>문의하기</Text>
        </Pressable>
      </View>
      <Text style={styles.version}>버전 {Constants.expoConfig?.version}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 12 },
  sectionTitle: { color: color.muted, fontSize: 14, marginBottom: 2 },
  row: {
    marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: color.line
  },
  rowText: { flex: 1, minWidth: 0, gap: 4 },
  rowTitle: { color: color.text, fontSize: 16 },
  rowHint: { color: color.muted, fontSize: 13, lineHeight: 18 },
  links: { marginTop: 20, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line },
  link: { minHeight: 44, justifyContent: 'center', paddingVertical: 10 },
  linkText: { color: color.text, fontSize: 15, textDecorationLine: 'underline' },
  pressed: { opacity: 0.65 },
  version: { marginTop: 24, color: color.muted, fontSize: 13 }
})
