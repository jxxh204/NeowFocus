import { StyleSheet, Text, View, Pressable } from 'react-native'
import { color, radius } from '@/theme'
import { useFocus } from './FocusProvider'

export function SyncConflict() {
  const { state, resolveConflict, nativeError } = useFocus()
  if (!state.conflicts?.length) return nativeError ? <Text accessibilityRole="alert" style={styles.note}>{nativeError}</Text> : null
  return <View accessibilityRole="alert" style={styles.card}>
    <Text style={styles.title}>어떤 집중을 이어갈까요?</Text>
    <Text style={styles.note}>다른 기기에서도 집중을 시작했어요. 모두 기록에 남깁니다.</Text>
    {state.conflicts.map((session) => <Pressable key={session.id} style={styles.choice} accessibilityRole="button" onPress={() => resolveConflict(session.id)}>
      <Text style={styles.title}>{session.task}</Text><Text style={styles.note}>{new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 시작 · 이어가기</Text>
    </Pressable>)}
  </View>
}
const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: radius.control, backgroundColor: color.surface, gap: 12, width: '100%' },
  choice: { minHeight: 48, paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.line, gap: 4 },
  title: { color: color.text, fontSize: 15 }, note: { color: color.muted, fontSize: 12, lineHeight: 18 }
})
