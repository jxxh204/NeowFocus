import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { color } from '@/theme'
import { useFocus } from './FocusProvider'
import { useSettings } from './SettingsProvider'

const labels = { off: '이 기기에만 저장', connecting: '연결 중', synced: '동기화됨', offline: '연결을 확인해 주세요', conflict: '이어갈 집중을 선택해 주세요' }
export function IntegrationSettings() {
  const { settings, update } = useSettings()
  const { capabilities, syncStatus, syncError, nativeError, retrySync } = useFocus()
  return <View style={styles.group}>
    <View style={styles.row}><Text style={styles.label}>iCloud 동기화</Text>
      <Switch accessibilityLabel="iCloud 동기화" value={settings.syncEnabled} disabled={!capabilities.cloudKit}
        onValueChange={(syncEnabled) => update({ syncEnabled })} ios_backgroundColor={color.switchOff} style={{ flexShrink: 0 }} trackColor={{ false: color.switchOff, true: color.timer }} thumbColor={settings.syncEnabled ? color.bg : color.cat} />
    </View>
    <Text style={styles.note}>{capabilities.cloudKit ? labels[syncStatus] : '설치된 iOS 앱에서 연결할 수 있어요.'}</Text>
    {settings.syncEnabled && <Text style={styles.note}>같은 Apple 계정의 기기에서 이어갑니다. 연결을 끊어도 이 기기의 기록은 남아요.</Text>}
    {syncError && <Pressable accessibilityRole="button" onPress={retrySync}><Text style={styles.note}>{syncError} · 다시 시도</Text></Pressable>}
    <View style={styles.row}><Text style={styles.label}>잠금화면에 할 일 표시</Text>
      <Switch accessibilityLabel="잠금화면에 할 일 표시" value={settings.showTaskOnLockScreen} onValueChange={(showTaskOnLockScreen) => update({ showTaskOnLockScreen })}
        ios_backgroundColor={color.switchOff} style={{ flexShrink: 0 }} trackColor={{ false: color.switchOff, true: color.timer }} thumbColor={settings.showTaskOnLockScreen ? color.bg : color.cat} />
    </View>
    {nativeError && <Text accessibilityRole="alert" style={styles.note}>{nativeError}</Text>}
  </View>
}

const styles = StyleSheet.create({
  group: { gap: 12 }, row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 15, color: color.text }, note: { fontSize: 12, lineHeight: 18, color: color.muted }
})
