import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { achievementForDay, formatClock, localDayKey, remainingOf, type FocusSession } from '@neowfocus/core'
import { Button } from '@/components/Button'
import { CompletionPaw, type PawTarget } from '@/components/CompletionPaw'
import { CompletionCat, useDayEndMotion } from '@/components/CompletionCat'
import { catEntryGeometry, nextCatEntry, type CatEntry } from '@/components/completionGeometry'
import { FocusControlsSheet } from '@/components/FocusControlsSheet'
import { TimerScene } from '@/components/timer/TimerScene'
import { clampProgress } from '@/components/timer/geometry'
import { CircularTimer } from '@/components/CircularTimer'
import { DurationChips } from '@/components/DurationChips'
import { CatFace, ChartIcon, SettingsIcon, Paw } from '@/components/Icons'
import { SecondarySheet } from '@/components/SecondarySheet'
import { useFocus } from '@/focus/FocusProvider'
import { SyncConflict } from '@/focus/SyncConflict'
import { formatDuration } from '@/focus/format'
import { useSettings } from '@/focus/SettingsProvider'
import { sessionAppearance, type SessionAppearance, type TimerStyle } from '@/focus/timerStyle'
import { RecordsPanel } from '@/ui/RecordsPanel'
import { SettingsPanel } from '@/ui/SettingsPanel'
import { FIRST_TASK, FIRST_TASK_MINUTES, useFirstTaskSuggestion } from '@/ui/useFirstTaskSuggestion'
import { color, radius } from '@/theme'

const TASK_MAX_LENGTH = 54
const READY_MINUTES = [5, 15, 25, 45, 60] as const

type Panel = 'records' | 'settings' | null

export default function FocusScreen() {
  const { state, now, dismiss, completionFeedback, finishBreak } = useFocus()
  const { settings, update } = useSettings()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const [panel, setPanel] = useState<Panel>(null)
  const [recordDay, setRecordDay] = useState<string>()
  const params = useLocalSearchParams<{ panel?: string; prepare?: string; recordDay?: string }>()
  const router = useRouter()
  const current = state.current
  const active = current?.status === 'running' || current?.status === 'paused'
  const [appearance, setAppearance] = useState<SessionAppearance | null>(null)
  const nextAppearance = sessionAppearance(appearance, current?.id ?? null, active, settings.timerStyle)
  // A guarded render-time update keeps completion's first frame on the same scene.
  if (nextAppearance !== appearance) setAppearance(nextAppearance)
  const sceneStyle = nextAppearance.timerStyle
  const screen = useRef<View>(null)
  const [mode, setMode] = useState<'home' | 'today'>('home')
  const [dayVisit, setDayVisit] = useState(0)
  const [dayEntry, setDayEntry] = useState<CatEntry>('top')
  const [displayedCount, setDisplayedCount] = useState(0)
  const [seed, setSeed] = useState<{ task: string; minutes: number }>()
  const [readyVisit, setReadyVisit] = useState(0)
  const lastFinished = useRef<FocusSession | null>(null)
  if (current?.status === 'finished') lastFinished.current = current
  const today = achievementForDay(state.records, now)
  const dayId = mode === 'today' && !active && !state.conflicts?.length ? `${today.day}-${dayVisit}` : undefined
  const [pawTarget, setPawTarget] = useState<(PawTarget & { dayId: string }) | null>(null)
  const [catImageLoaded, setCatImageLoaded] = useState(false)
  const targetReady = Boolean(dayId && pawTarget?.dayId === dayId)
  const dayMotion = useDayEndMotion(dayId, targetReady && catImageLoaded && panel === null, today.count, setDisplayedCount)
  const doneId = mode === 'home' && current?.status === 'finished' && !state.conflicts?.length ? current.id : undefined
  useEffect(() => { if (doneId) completionFeedback(doneId) }, [doneId, completionFeedback])
  const stampRotation = catEntryGeometry(dayEntry, pawTarget ?? { x: width / 2, y: height / 2 }, { width, height }).stampRotation
  const measurePawTarget = useCallback((target: PawTarget) => {
    if (!dayId) return
    screen.current?.measureInWindow((x, y) => setPawTarget({ x: target.x - x, y: target.y - y, dayId }))
  }, [dayId])
  useEffect(() => { if (active) setMode('home') }, [active])
  const prepareNext = (sameTask = true) => {
    const previous = lastFinished.current
    setSeed({ task: sameTask ? previous?.task ?? '' : '', minutes: previous ? previous.plannedMs / 60_000 : settings.defaultMinutes })
    setReadyVisit(value => value + 1)
    update({ restDay: undefined })
    setMode('home')
    dismiss()
  }
  const showToday = () => {
    finishBreak()
    if (current) completionFeedback(current.id)
    const entry = nextCatEntry(settings.lastDayEndEntry)
    setDayEntry(entry)
    update({ lastDayEndEntry: entry })
    setDisplayedCount(0)
    setDayVisit(value => value + 1)
    setMode('today')
  }
  const rest = () => { update({ restDay: today.day }); setMode('home'); dismiss() }
  const timerSize = Math.min(268, Math.max(164, width - 112), Math.max(164, height * 0.34))

  // Old links keep working, but records and settings now open over the same canvas.
  useEffect(() => {
    if (params.panel !== 'records' && params.panel !== 'settings') return
    setRecordDay(params.panel === 'records' ? params.recordDay : undefined)
    setPanel(params.panel)
    router.setParams({ panel: undefined, recordDay: undefined })
  }, [params.panel, params.recordDay, router])

  useEffect(() => {
    if (params.prepare && (current || state.conflicts?.length)) router.setParams({ prepare: undefined })
  }, [params.prepare, current, state.conflicts?.length, router])

  const openPanel = (next: Panel) => {
    Keyboard.dismiss()
    setRecordDay(undefined)
    setPanel(next)
  }

  return (
    <View ref={screen} collapsable={false} style={styles.screen}>
      {!state.conflicts?.length && !dayId && current && (active || current.status === 'finished') && <TimerScene
        key={`${current.id}-${sceneStyle}`} style={sceneStyle}
        progress={clampProgress(current.status === 'finished' ? current.focusedMs / current.plannedMs : 1 - remainingOf(current, now) / current.plannedMs)}
        running={current.status === 'running' && panel === null} />}
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="집중 기록 열기" style={styles.iconButton} onPress={() => openPanel('records')}>
            <ChartIcon />
          </Pressable>
          <CatFace focused={current?.status === 'running'} />
          <Pressable accessibilityRole="button" accessibilityLabel="설정 열기" style={styles.iconButton} onPress={() => openPanel('settings')}>
            <SettingsIcon />
          </Pressable>
        </View>
        <ScrollView
          style={styles.body}
          contentContainerStyle={[styles.canvas, active && !state.conflicts?.length && styles.activeCanvas]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <SyncConflict />
          {!state.conflicts?.length && (active && current ? <Session session={current} timerSize={timerSize} />
            : dayId ? <Today count={displayedCount} actualCount={today.count} focusedMs={today.focusedMs} tasks={today.tasks}
                progress={dayMotion.stamp} catProgress={dayMotion.progress} rotation={stampRotation} onTarget={measurePawTarget} onContinue={() => prepareNext()} onRest={rest} />
            : current?.status === 'finished' ? <Done session={current} timerStyle={sceneStyle} onAgain={() => prepareNext()} onNew={() => prepareNext(false)} onToday={showToday} />
            : settings.restDay === localDayKey(now) ? <Rest count={today.count} onStart={() => prepareNext(false)} />
            : <Ready key={readyVisit} timerSize={timerSize} seed={seed} todayCount={today.count} prepareFirstTask={params.prepare === 'first-task'} onPrepared={() => router.setParams({ prepare: undefined })} />)}
        </ScrollView>
        <SecondarySheet closeLabel={panel === 'settings' ? '완료' : '닫기'} title={panel === 'records' ? '집중 기록' : '설정'} visible={panel !== null} onClose={() => setPanel(null)}>
          {panel === 'records' ? <RecordsPanel day={recordDay} /> : panel === 'settings' ? <SettingsPanel /> : null}
        </SecondarySheet>
      </KeyboardAvoidingView>
      {dayId && targetReady && panel === null && pawTarget && <CompletionCat target={pawTarget} progress={dayMotion.progress} entry={dayEntry} viewport={{ width, height }} onReady={() => setCatImageLoaded(true)} />}
    </View>
  )
}

function Ready({ timerSize, seed, todayCount, prepareFirstTask, onPrepared }: { timerSize: number; seed?: { task: string; minutes: number }; todayCount: number; prepareFirstTask: boolean; onPrepared: () => void }) {
  const { start, state, firstSuggestionReady, firstSuggestionDay, markFirstSuggestion } = useFocus()
  const { settings } = useSettings()
  const [task, setTask] = useState(seed?.task ?? '')
  const [minutes, setMinutes] = useState(seed?.minutes ?? settings.defaultMinutes)
  const [editingTime, setEditingTime] = useState(false)
  const [customMinutes, setCustomMinutes] = useState(String(seed?.minutes ?? settings.defaultMinutes))
  const suggestion = useFirstTaskSuggestion({ state, confirmed: firstSuggestionReady, sharedDay: firstSuggestionDay, markDay: markFirstSuggestion })
  useEffect(() => {
    if (!seed) { setMinutes(settings.defaultMinutes); setCustomMinutes(String(settings.defaultMinutes)) }
  }, [settings.defaultMinutes, seed])
  useEffect(() => {
    if (!prepareFirstTask || !suggestion.evaluated || !firstSuggestionReady) return
    // A stale widget link must never overwrite a draft, bypass daily eligibility, or start a timer.
    if (!task && suggestion.visible) {
      setTask(FIRST_TASK)
      setMinutes(FIRST_TASK_MINUTES)
      setCustomMinutes(String(FIRST_TASK_MINUTES))
      suggestion.dismiss()
    }
    onPrepared()
  }, [prepareFirstTask, firstSuggestionReady, suggestion.evaluated, suggestion.visible, suggestion.dismiss, task, onPrepared])
  const canStart = task.trim().length > 0 && minutes >= 1 && minutes <= 180

  const chooseMinutes = (value: number) => {
    setMinutes(value)
    setCustomMinutes(String(value))
  }
  const submit = () => {
    if (!canStart) return
    suggestion.dismiss()
    Keyboard.dismiss()
    start(task, minutes)
  }

  return (
    <View style={styles.fill}>
      <View style={styles.main}>
        {todayCount > 0 && <View style={styles.todayQuiet}><Paw size={16} /><Text style={styles.todayQuietText}>오늘 {todayCount}번의 집중</Text></View>}
        <TextInput
          value={task}
          onChangeText={(value) => { setTask(value); if (value.length) suggestion.dismiss() }}
          onSubmitEditing={submit}
          placeholder="지금 할 일 하나"
          placeholderTextColor={color.muted}
          maxLength={TASK_MAX_LENGTH}
          returnKeyType="go"
          accessibilityLabel="지금 할 일"
          style={styles.input}
        />
        {suggestion.visible && !task && (
          <View style={styles.suggestion}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${FIRST_TASK}, 5분으로 준비`}
              style={styles.suggestionChoice}
              onPress={() => {
                setTask(FIRST_TASK)
                chooseMinutes(FIRST_TASK_MINUTES)
                suggestion.dismiss()
              }}
            >
              <Text style={styles.suggestionText}>{FIRST_TASK} · 5분</Text>
              <Text style={styles.suggestionAction}>이걸로 준비</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="오늘 제안 건너뛰기" style={styles.iconButton} onPress={suggestion.dismiss}>
              <Text style={styles.skip}>×</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.timer}>
          {settings.timerStyle === 'classic' && <CircularTimer remaining={1} size={timerSize} />}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`집중 시간 ${minutes || customMinutes || '입력 필요'}분, 수정`}
            accessibilityState={{ expanded: editingTime }}
            style={styles.timeButton}
            onPress={() => setEditingTime((value) => !value)}
          >
            <Text style={styles.clock}>{minutes || customMinutes || '—'}분</Text>
            <Text style={styles.changeLabel}>{editingTime ? '접기' : '바꾸기'}</Text>
          </Pressable>
        </View>
        {editingTime && (
          <View style={styles.timeEditor}>
            <DurationChips value={minutes} onChange={chooseMinutes} options={READY_MINUTES} />
            <View style={styles.customTime}>
              <Text style={styles.customLabel}>직접 입력</Text>
              <TextInput
                value={customMinutes}
                onChangeText={(value) => {
                  const digits = value.replace(/\D/g, '').slice(0, 3)
                  setCustomMinutes(digits)
                  setMinutes(Number(digits))
                }}
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
                accessibilityLabel="집중 시간, 1분부터 180분"
                style={styles.minutesInput}
              />
              <Text style={styles.customLabel}>분</Text>
            </View>
            {(minutes < 1 || minutes > 180) && <Text style={styles.timeError}>1분부터 180분까지 정할 수 있어요.</Text>}
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <Button label="집중 시작" onPress={submit} disabled={!canStart} />
      </View>
    </View>
  )
}

function Session({ session, timerSize }: { session: FocusSession; timerSize: number }) {
  const { now, pause, resume, finish } = useFocus()
  const { settings } = useSettings()
  const [controls, setControls] = useState(false)
  const paused = session.status === 'paused'
  const remaining = remainingOf(session, now)
  const progress = clampProgress(1 - remaining / session.plannedMs)
  const classic = settings.timerStyle === 'classic'

  return <View style={styles.fill}>
    <Pressable style={[styles.main, styles.sessionCanvas]} accessibilityRole="button" accessibilityLabel={`${session.task}, ${paused ? '잠시 멈춤' : '집중 중'}, 타이머 조작 열기`}
      accessibilityValue={{ text: `${Math.round(progress * 100)}퍼센트 진행${settings.showRemainingTime ? `, 남은 시간 ${formatClock(remaining)}` : ''}` }}
      accessibilityHint="잠시 멈춤과 마침 버튼을 열어요." onPress={() => setControls(true)}>
      <Text style={styles.task} accessibilityRole="header">{session.task}</Text>
      <View accessibilityRole="progressbar" accessibilityLabel={paused ? '집중 잠시 멈춤' : '집중 중'}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }} style={styles.timer}>
        {classic && <CircularTimer remaining={remaining / session.plannedMs} paused={paused} size={timerSize} />}
        <Text style={[styles.sessionCaption, !classic && styles.sceneCaption]}>
          {paused ? '잠시 멈춤' : classic ? '집중 중' : `${Math.floor((session.plannedMs - remaining) / 60_000)}분의 집중`}
        </Text>
        {settings.showRemainingTime && <Text style={styles.clock} accessibilityLabel={`남은 시간 ${formatClock(remaining)}`}>{formatClock(remaining)}</Text>}
      </View>
    </Pressable>
    {controls && <FocusControlsSheet paused={paused} onToggle={paused ? resume : pause} onFinish={finish} onClose={() => setControls(false)} />}
  </View>
}

function Done({ session, timerStyle, onAgain, onNew, onToday }: { session: FocusSession; timerStyle: TimerStyle; onAgain: () => void; onNew: () => void; onToday: () => void }) {
  const { breakRemaining, breakFinished, finishBreak } = useFocus()
  const sceneText = timerStyle !== 'classic' && styles.sceneText
  return <View style={styles.fill}>
    <View style={[styles.main, styles.done]}>
      <View style={styles.completedPaw}><Paw size={52} /></View>
      <Text style={styles.doneTitle}>{breakRemaining > 0 ? '잠깐 쉬어가요.' : breakFinished ? '휴식이 끝났어요.' : '집중 하나가 쌓였어요.'}</Text>
      <Text style={styles.doneTask}>{session.task}</Text>
      <Text style={[styles.doneNote, sceneText]} accessibilityLabel={breakRemaining > 0 ? `휴식 남은 시간 ${formatClock(breakRemaining * 1000)}` : undefined}>
        {breakRemaining > 0 ? `${formatClock(breakRemaining * 1000)} 남았어요.` : `${formatDuration(session.focusedMs)} 집중했어요.`}
      </Text>
    </View>
    <View style={styles.actions}>
      {breakRemaining > 0 ? <Button label="휴식 끝내기" onPress={finishBreak} /> : <View style={styles.sessionActions}>
        <View style={styles.sessionAction}><Button label="한번 더" onPress={onAgain} /></View>
        <Pressable accessibilityRole="button" onPress={onNew} style={styles.finishButton}><Text style={[styles.secondaryText, sceneText]}>새 작업</Text></Pressable>
      </View>}
      <Pressable accessibilityRole="button" onPress={onToday} style={styles.dayEndButton}><Text style={[styles.secondaryText, sceneText]}>오늘은 여기까지</Text></Pressable>
    </View>
  </View>
}

function Today({ count, actualCount, focusedMs, tasks, progress, catProgress, rotation, onTarget, onContinue, onRest }: {
  count: number; actualCount: number; focusedMs: number; tasks: string[]; progress: Animated.Value; catProgress: Animated.Value;
  rotation: number; onTarget: (target: PawTarget) => void; onContinue: () => void; onRest: () => void
}) {
  const time = formatDuration(focusedMs)
  return <View style={styles.fill}>
    <View style={[styles.main, styles.done]}>
      <Animated.Text style={[styles.doneTitle, { opacity: catProgress.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 0, 1] }) }]}>{actualCount ? '오늘도 집중을\n쌓았어요.' : '오늘 기록은\n아직 없어요.'}</Animated.Text>
      <View style={styles.dayStamp}><CompletionPaw progress={progress} rotation={rotation} onTarget={onTarget} placed={count > 0} /></View>
      <Text style={styles.dayCount} accessibilityLabel={`오늘 ${actualCount}번의 집중`}>{count}번의 집중</Text>
      <Text style={styles.doneNote}>{time}{time.endsWith('초') ? '를' : '을'} 쌓았어요.</Text>
      {tasks.length > 0 && <Text style={styles.dayTasks} numberOfLines={2}>{tasks.join(' · ')}</Text>}
    </View>
    <View style={styles.sessionActions}>
      <Pressable accessibilityRole="button" onPress={onContinue} style={styles.finishButton}><Text style={styles.secondaryText}>계속하기</Text></Pressable>
      <View style={styles.sessionAction}><Button label="오늘 마무리" onPress={onRest} /></View>
    </View>
  </View>
}

function Rest({ count, onStart }: { count: number; onStart: () => void }) {
  return <View style={styles.fill}>
    <View style={[styles.main, styles.done]}>
      <CatFace size={40} />
      <Text style={styles.doneTitle}>편하게 쉬어요.</Text>
      <Text style={styles.introText}>오늘 쌓은 {count}번의 집중은{ '\n' }그대로 남아 있어요.</Text>
    </View>
    <View style={styles.actions}><Button label="다시 집중하기" onPress={onStart} /></View>
  </View>
}

const styles = StyleSheet.create({
  completedPaw: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface },
  screen: { flex: 1, backgroundColor: color.bg },
  header: { height: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  canvas: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 12, paddingBottom: 24, width: '100%', maxWidth: 520, alignSelf: 'center' },
  activeCanvas: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0, maxWidth: '100%' },
  sessionCanvas: { paddingHorizontal: 28 },
  fill: { flex: 1 },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  input: { width: '100%', minHeight: 52, paddingHorizontal: 16, borderRadius: radius.control, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line, color: color.text, fontSize: 19, textAlign: 'center' },
  sessionCaption: { color: color.muted, fontSize: 13, textAlign: 'center' },
  sceneText: { color: '#e0ebef' },
  sceneCaption: { color: '#e0ebef', textShadowColor: '#272727', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  task: { textShadowColor: '#272727', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6, color: color.text, fontSize: 22, lineHeight: 30, fontWeight: '500', letterSpacing: -0.5, textAlign: 'center' },
  timer: { marginTop: 32, alignItems: 'center', gap: 16 },
  clock: { color: color.timer, fontSize: 21, lineHeight: 27, fontWeight: '500', fontVariant: ['tabular-nums'] },
  pausedClock: { color: color.paused },
  pausedLabel: { color: color.muted, fontSize: 13, marginTop: -8 },
  timeButton: { minHeight: 44, minWidth: 100, alignItems: 'center', justifyContent: 'center', gap: 3 },
  changeLabel: { color: color.muted, fontSize: 12 },
  actions: { gap: 2, paddingTop: 12 },
  sessionActions: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  sessionAction: { flex: 1, minWidth: 0 },
  finishButton: { flex: 1, minWidth: 0, minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  secondaryText: { color: color.muted, fontSize: 14 },
  suggestion: { marginTop: 8, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 4 },
  suggestionChoice: { flex: 1, minHeight: 48, justifyContent: 'center', gap: 4 },
  suggestionText: { color: color.muted, fontSize: 13, lineHeight: 19 },
  suggestionAction: { color: color.text, fontSize: 13 },
  skip: { color: color.muted, fontSize: 23 },
  timeEditor: { marginTop: 12, width: '100%', gap: 12 },
  customTime: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  customLabel: { color: color.muted, fontSize: 14 },
  minutesInput: { minHeight: 44, minWidth: 64, paddingHorizontal: 10, textAlign: 'center', color: color.text, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line, borderRadius: radius.control, fontSize: 17 },
  timeError: { color: color.muted, fontSize: 13, textAlign: 'center' },
  todayQuiet: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  todayQuietText: { color: color.muted, fontSize: 13 },
  introText: { color: color.muted, fontSize: 16, lineHeight: 27, textAlign: 'center' },
  dayEndButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  dayStamp: { marginTop: 20, marginBottom: 12 },
  dayCount: { color: color.text, fontSize: 32, lineHeight: 40, fontWeight: '600', textAlign: 'center' },
  dayTasks: { color: color.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  done: { gap: 12 },
  doneTitle: { marginTop: 16, color: color.text, fontSize: 25, fontWeight: '600', letterSpacing: -0.6, textAlign: 'center' },
  doneTask: { color: color.text, fontSize: 17, lineHeight: 24, textAlign: 'center' },
  doneNote: { color: color.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' }
})
