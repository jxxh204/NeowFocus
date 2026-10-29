import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { useSettings } from '@/focus/SettingsProvider'
import type { TimerStyle } from '@/focus/timerStyle'
import { color } from '@/theme'

const choices: { id: TimerStyle; title: string; description: string }[] = [
  { id: 'classic', title: '기존 원형', description: '익숙한 원형 타이머로 집중해요.' },
  { id: 'blocks', title: '쌓이는 블록', description: '집중한 만큼 화면 가득 쌓여요.' },
  { id: 'water', title: '차오르는 물', description: '잔잔한 물이 아래에서 올라와요.' }
]

export function TimerStyleSettings() {
  const { settings, update } = useSettings()
  return <View>
    <Text style={styles.heading}>타이머 스타일</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="타이머 스타일">
      {choices.map(choice => <Pressable key={choice.id} accessibilityRole="radio"
        accessibilityLabel={`${choice.title}, ${choice.description}`} accessibilityState={{ checked: settings.timerStyle === choice.id }}
        onPress={() => update({ timerStyle: choice.id })} style={({ pressed }) => [styles.choice, pressed && styles.pressed]}>
        <Thumbnail style={choice.id} />
        <View style={styles.copy}><Text style={styles.title}>{choice.title}</Text><Text style={styles.description}>{choice.description}</Text></View>
        <View style={[styles.radio, settings.timerStyle === choice.id && styles.selected]}>
          {settings.timerStyle === choice.id && <View style={styles.dot} />}
        </View>
      </Pressable>)}
    </View>
    <Pressable accessibilityRole="checkbox" accessibilityLabel="남은 시간 표시" accessibilityState={{ checked: settings.showRemainingTime }}
      onPress={() => update({ showRemainingTime: !settings.showRemainingTime })} style={styles.timeOption}>
      <View style={[styles.check, settings.showRemainingTime && styles.checked]}>
        {settings.showRemainingTime && <Svg width={16} height={16} viewBox="0 0 16 16"><Path d="M3 8l3 3 7-7" fill="none" stroke="#272727" strokeWidth={2} /></Svg>}
      </View><Text style={styles.timeText}>남은 시간 표시</Text>
    </Pressable>
    <Text style={styles.note}>집중 도중에도 스타일을 바꿀 수 있어요.{ '\n' }지금까지 집중한 시간은 그대로 유지됩니다.</Text>
  </View>
}

function Thumbnail({ style }: { style: TimerStyle }) {
  return <View style={styles.thumbnail} accessibilityElementsHidden>
    <Svg width={54} height={64} viewBox="0 0 54 64">
      {style === 'classic' ? <><Circle cx={27} cy={32} r={16} fill="none" stroke="#7b7d7b" strokeWidth={4} />
        <Path d="M27 16a16 16 0 1 1-16 16" fill="none" stroke="#eee" strokeWidth={4} strokeLinecap="round" /></>
        : style === 'blocks' ? <>{[[0,46],[14,46],[28,46],[42,46],[14,32],[28,32],[42,32],[42,18]].map(([x,y]) => <Rect key={`${x}-${y}`} x={x} y={y} width={12} height={14} fill="#858b85" />)}</>
        : <><Path d="M0 31Q12 24 27 31T54 31V64H0Z" fill="#526d78" /><Path d="M0 31Q12 24 27 31T54 31" fill="none" stroke="#a8c2c7" strokeWidth={1.2} /></>}
    </Svg>
  </View>
}
const styles = StyleSheet.create({
  heading: { color: color.muted, fontSize: 14, marginBottom: 16 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderTopColor: color.line, borderTopWidth: StyleSheet.hairlineWidth },
  thumbnail: { width: 54, height: 64, borderRadius: 8, backgroundColor: '#212121', overflow: 'hidden' },
  copy: { flex: 1, minWidth: 0, gap: 7 },
  title: { color: color.text, fontSize: 17, fontWeight: '600' },
  description: { color: color.muted, fontSize: 14, lineHeight: 21 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#838383', alignItems: 'center', justifyContent: 'center' },
  selected: { borderColor: '#e0e0e0' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#e0e0e0' },
  timeOption: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, marginTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line, paddingTop: 10 },
  timeText: { color: color.muted, fontSize: 15 },
  check: { width: 18, height: 18, borderRadius: 2, borderWidth: 1, borderColor: '#838383', alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: '#e0e0e0', borderColor: '#e0e0e0' },
  note: { color: color.muted, fontSize: 14, lineHeight: 23, marginTop: 14, marginBottom: 24 },
  pressed: { opacity: .65 }
})
