import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import Native from '../../modules/neowfocus-native'
import { color } from '@/theme'
import { useFocus } from './FocusProvider'
import { useSettings } from './SettingsProvider'

const labels = { off: '이 기기에만 저장', connecting: '연결 중', synced: '동기화됨', offline: '연결을 확인해 주세요', conflict: '이어갈 집중을 선택해 주세요' }
export function IntegrationSettings() {
  const { settings, update } = useSettings()
  const { capabilities, syncStatus, syncError, calendarStatus, calendarError, nativeError, retrySync } = useFocus()
  const [connecting, setConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string>()
  const connectionPending = useRef(false)
  async function connectCalendar(enabled: boolean) {
    if (connectionPending.current) return
    if (!enabled) { update({ calendarSyncEnabled: false }); return }
    connectionPending.current = true
    setConnecting(true); setConnectionError(undefined)
    try {
      await Native!.calendarConnect()
      update({ syncEnabled: true, calendarSyncEnabled: true })
    } catch (error) { setConnectionError(error instanceof Error ? error.message : String(error)) }
    finally { connectionPending.current = false; setConnecting(false) }
  }
  return <View style={styles.group}>
    <View style={styles.row}><Text style={styles.label}>iCloud 동기화</Text>
      <Switch accessibilityLabel="iCloud 동기화" value={settings.syncEnabled} disabled={!capabilities.cloudKit || connecting}
        onValueChange={(syncEnabled) => update({ syncEnabled, ...(!syncEnabled ? { calendarSyncEnabled: false } : {}) })} ios_backgroundColor={color.switchOff} style={{ flexShrink: 0 }} trackColor={{ false: color.switchOff, true: color.timer }} thumbColor={settings.syncEnabled ? color.bg : color.cat} />
    </View>
    <Text style={styles.note}>{capabilities.cloudKit ? labels[syncStatus] : '설치된 iOS 앱에서 연결할 수 있어요.'}</Text>
    <Text style={styles.note}>켜면 집중한 목록과 시간을 iCloud에 저장하고, 같은 Apple 계정의 기기에서 이어갑니다. 끄면 이 기기에만 저장합니다.</Text>
    {syncError && <Pressable accessibilityRole="button" onPress={retrySync}><Text style={styles.note}>{syncError} · 다시 시도</Text></Pressable>}
    <View style={styles.row}><Text style={styles.label}>냐우캘린더 연동</Text>
      <Switch accessibilityLabel="냐우캘린더 연동" value={settings.calendarSyncEnabled} disabled={!capabilities.calendar || connecting}
        onValueChange={enabled => { void connectCalendar(enabled) }} ios_backgroundColor={color.switchOff} style={{ flexShrink: 0 }}
        trackColor={{ false: color.switchOff, true: color.timer }} thumbColor={settings.calendarSyncEnabled ? color.bg : color.cat} />
    </View>
    <Text style={styles.note}>{!capabilities.calendar ? '최신 iOS 앱에서 연결할 수 있어요.' : connecting ? '캘린더 연결 중' : ({ off: '연결 안 됨', waiting: 'iCloud 기록 동기화 후 반영합니다.', syncing: '캘린더에 반영 중', synced: '캘린더에 반영됨', error: '연결을 확인해 주세요.' })[calendarStatus]}</Text>
    <Text style={styles.note}>켜면 iCloud 동기화도 켜집니다. 전용 ‘냐우포커스’ 캘린더에 하루 집중 횟수와 총 시간을 일정 하나로 갱신해요. 작업 이름은 보내지 않습니다. 냐우캘린더에서도 iPhone 캘린더 접근을 허용해 주세요. 끄면 기존 일정은 남습니다.</Text>
    {(connectionError || calendarError) && <Pressable accessibilityRole="button" onPress={() => { if (settings.calendarSyncEnabled) retrySync(); else void connectCalendar(true) }}>
      <Text accessibilityRole="alert" style={styles.note}>{connectionError || calendarError} · 다시 시도</Text>
    </Pressable>}
    <View style={styles.row}><Text style={styles.label}>잠금화면에 할 일 표시</Text>
      <Switch accessibilityLabel="잠금화면에 할 일 표시" value={settings.showTaskOnLockScreen} onValueChange={(showTaskOnLockScreen) => update({ showTaskOnLockScreen })}
        ios_backgroundColor={color.switchOff} style={{ flexShrink: 0 }} trackColor={{ false: color.switchOff, true: color.timer }} thumbColor={settings.showTaskOnLockScreen ? color.bg : color.cat} />
    </View>
    {nativeError && <Text accessibilityRole="alert" style={styles.note}>{nativeError}</Text>}
  </View>
}

const styles = StyleSheet.create({
  group: { gap: 12 }, row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { flex: 1, fontSize: 15, color: color.text }, note: { fontSize: 12, lineHeight: 18, color: color.muted }
})
