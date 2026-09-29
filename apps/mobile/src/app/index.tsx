import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { MIN_RECORD_MS, formatClock, remainingOf, type FocusSession } from '@neowfocus/core'
import { Button } from '@/components/Button'
import { CircularTimer } from '@/components/CircularTimer'
import { DurationChips } from '@/components/DurationChips'
import { CatFace, ChartIcon, Paw, SettingsIcon } from '@/components/Icons'
import { useFocus } from '@/focus/FocusProvider'
import { formatDuration } from '@/focus/format'
import { useSettings } from '@/focus/SettingsProvider'
import { color, radius } from '@/theme'

// 데스크톱 INPUT_LIMITS.TASK_NAME_MAX_LENGTH와 같다.
const TASK_MAX_LENGTH = 54

export default function FocusScreen() {
  const { state } = useFocus()
  const insets = useSafeAreaInsets()
  const current = state.current

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header focused={current?.status === 'running'} />
      <View style={styles.body}>
        {!current ? (
          <Ready />
        ) : current.status === 'finished' ? (
          <Done session={current} />
        ) : (
          <Session session={current} />
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

function Header({ focused }: { focused: boolean }) {
  return (
    <View style={styles.header}>
      <CatFace focused={focused} />
      <View style={styles.headerActions}>
        <Link href="/records" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="집중 기록"
            hitSlop={10}
            style={styles.iconButton}
          >
            <ChartIcon />
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="설정"
            hitSlop={10}
            style={styles.iconButton}
          >
            <SettingsIcon />
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

function Ready() {
  const { start } = useFocus()
  const { settings } = useSettings()
  const [task, setTask] = useState('')
  const [minutes, setMinutes] = useState(settings.defaultMinutes)
  useEffect(() => setMinutes(settings.defaultMinutes), [settings.defaultMinutes])
  const canStart = task.trim().length > 0
  const submit = () => canStart && start(task, minutes)

  return (
    <View style={styles.fill}>
      <Text style={styles.title}>지금 무엇에{'\n'}집중할까요?</Text>
      <TextInput
        value={task}
        onChangeText={setTask}
        onSubmitEditing={submit}
        placeholder="한 가지만 적어주세요"
        placeholderTextColor={color.muted}
        maxLength={TASK_MAX_LENGTH}
        returnKeyType="go"
        accessibilityLabel="지금 할 일"
        style={styles.input}
      />
      <Text style={styles.label}>얼마나</Text>
      <DurationChips value={minutes} onChange={setMinutes} />
      <View style={styles.spacer} />
      <Button label="집중 시작하기" onPress={submit} disabled={!canStart} />
    </View>
  )
}

function Session({ session }: { session: FocusSession }) {
  const { now, pause, resume, finish } = useFocus()
  const paused = session.status === 'paused'
  const remaining = remainingOf(session, now)

  return (
    <View style={styles.fill}>
      <Text style={styles.stateLabel}>
        {paused ? '잠시 쉬어가는 중' : '지금 이 일에 집중하고 있어요'}
      </Text>
      <Text style={styles.task} accessibilityRole="header">
        {session.task}
      </Text>
      <View style={styles.timer}>
        <CircularTimer remaining={remaining / session.plannedMs} paused={paused} size={188} />
        <Text
          style={[styles.clock, paused && { color: color.paused }]}
          accessibilityLabel={`남은 시간 ${formatClock(remaining)}`}
        >
          {formatClock(remaining)}
        </Text>
      </View>
      <View style={styles.spacer} />
      <View style={styles.actions}>
        {paused ? (
          <Button label="다시 집중하기" onPress={resume} />
        ) : (
          <Button label="잠시 멈추기" onPress={pause} />
        )}
        <Button label="여기까지 할게요" onPress={finish} variant="subtle" />
      </View>
    </View>
  )
}

function Done({ session }: { session: FocusSession }) {
  const { start, dismiss } = useFocus()
  const recorded = session.focusedMs >= MIN_RECORD_MS

  return (
    <View style={styles.fill}>
      <View style={styles.done}>
        <Paw size={60} />
        <Text style={styles.doneTitle}>{formatDuration(session.focusedMs)} 집중했어요.</Text>
        <Text style={styles.doneTask}>{session.task}</Text>
        <Text style={styles.doneNote}>
          {recorded
            ? '지금 쓴 시간만큼, 한 걸음 나아갔어요.'
            : '1분보다 짧은 집중은 기록에 남기지 않아요.'}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label="같은 일에 한 번 더"
          onPress={() => start(session.task, session.plannedMs / 60_000)}
        />
        <Button label="이번 집중 마치기" onPress={dismiss} variant="subtle" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  header: {
    height: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  fill: { flex: 1 },
  spacer: { flex: 1 },
  title: {
    color: color.text,
    fontSize: 26,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -0.6
  },
  input: {
    marginTop: 28,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: radius.control,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
    color: color.text,
    fontSize: 17
  },
  label: { marginTop: 28, marginBottom: 10, color: color.muted, fontSize: 14 },
  stateLabel: { color: color.muted, fontSize: 14 },
  task: {
    marginTop: 8,
    color: color.text,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.5
  },
  timer: { marginTop: 40, alignItems: 'center', gap: 20 },
  clock: {
    color: color.timer,
    fontSize: 56,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1
  },
  actions: { gap: 10 },
  done: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  doneTitle: {
    marginTop: 20,
    color: color.text,
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.6
  },
  doneTask: { color: color.text, fontSize: 17, textAlign: 'center' },
  doneNote: { color: color.muted, fontSize: 14, textAlign: 'center' }
})
