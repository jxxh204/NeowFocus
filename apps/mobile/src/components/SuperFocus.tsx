import { useEffect, useState, type ReactNode } from 'react'
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { AUTO_BREAK_MS, achievementForDay, formatClock, remainingOf, type FocusSession } from '@neowfocus/core'
import { useFocus } from '@/focus/FocusProvider'
import { formatDuration } from '@/focus/format'
import { CircularTimer } from './CircularTimer'
import { Paw } from './Icons'
import { useMotionPreference } from './motionPreference'

export const WORKROOM_STILL = require('../../assets/superfocus/workroom-still.png')
const WORKROOM_MOTION = require('../../assets/superfocus/workroom.webp')
const WORKROOM_RATIO = 1672 / 941
const CREAM = '#FFF4E2'
const GROUND = '#15100b'

type Phase = 'focus' | 'paused' | 'done' | 'break'

/** 작업실 그림을 화면 위쪽에 꽉 채우고, 아래로 어둡게 이어지게 깐다. 고양이와 창밖 버섯구름이 함께 보이도록 자른다. */
function Workroom({ moving, dimmed }: { moving: boolean; dimmed?: boolean }) {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const imageHeight = Math.round(height * 0.76)
  const imageWidth = Math.round(imageHeight * WORKROOM_RATIO)
  const left = Math.round(width / 2 - imageWidth * 0.62)
  const top = insets.top
  const fadeStart = top + imageHeight * 0.48
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Image source={moving ? WORKROOM_MOTION : WORKROOM_STILL} accessibilityIgnoresInvertColors
      style={{ position: 'absolute', left, top, width: imageWidth, height: imageHeight }} />
    {dimmed && <View style={[StyleSheet.absoluteFill, styles.dim]} />}
    <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
      <Defs>
        <LinearGradient id="sfTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={GROUND} stopOpacity={0.55} />
          <Stop offset="1" stopColor={GROUND} stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="sfBottom" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={GROUND} stopOpacity={0} />
          <Stop offset="1" stopColor={GROUND} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={top + 1} fill={GROUND} />
      <Rect x={0} y={top} width={width} height={126} fill="url(#sfTop)" />
      <Rect x={0} y={fadeStart} width={width} height={top + imageHeight - fadeStart + 1} fill="url(#sfBottom)" />
      <Rect x={0} y={top + imageHeight} width={width} height={Math.max(0, height - top - imageHeight)} fill={GROUND} />
    </Svg>
  </View>
}

function TopBar({ right }: { right: ReactNode }) {
  const insets = useSafeAreaInsets()
  return <View style={[styles.topBar, { top: insets.top + 12 }]} pointerEvents="box-none">
    <Text style={styles.place}>냐우의 작업실</Text>
    {right}
  </View>
}

function Pill({ label, onPress, primary = false, accessibilityLabel }: { label: string; onPress: () => void; primary?: boolean; accessibilityLabel?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress}
    style={({ pressed }) => [styles.pill, primary ? styles.pillPrimary : styles.pillSecondary, pressed && styles.pressed]}>
    <Text style={[styles.pillText, primary && styles.pillPrimaryText]}>{label}</Text>
  </Pressable>
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
    <Text style={styles.linkText}>{label}</Text>
  </Pressable>
}

/** 슈퍼포커스: 집중 화면 위에 작업실을 깔고, 상자 없이 그 위에 바로 UI를 올린다. 남은 집중 시간은 숨기고 휴식만 시간으로 보여준다. */
export function SuperFocusScreen({ session, onExit, onAgain, onNew, onToday }: {
  session: FocusSession; onExit: () => void; onAgain: () => void; onNew: () => void; onToday: () => void
}) {
  const { state, now, pause, resume, finish, breakRemaining, breakFinished, finishBreak } = useFocus()
  const insets = useSafeAreaInsets()
  const { reduced, active } = useMotionPreference()
  const [controls, setControls] = useState(false)
  const phase: Phase = session.status === 'finished' ? (breakRemaining > 0 ? 'break' : 'done') : session.status === 'paused' ? 'paused' : 'focus'
  useEffect(() => { if (phase !== 'focus') setControls(false) }, [phase])
  const remaining = remainingOf(session, now)
  const progress = Math.round((1 - remaining / session.plannedMs) * 100)
  const status = { focus: '집중하는 시간', paused: '잠시 멈춤', done: '집중 끝', break: '쉬어가는 시간' }[phase]
  const todayCount = achievementForDay(state.records, now).count
  const breakProgress = Math.min(1, Math.max(0, 1 - (breakRemaining * 1000) / AUTO_BREAK_MS))
  const moving = reduced === false && active && (phase === 'focus' || phase === 'break')
  const bottom = { bottom: Math.max(insets.bottom, 16) + 16 }

  return <View style={styles.screen} accessibilityViewIsModal>
    <Workroom moving={moving} dimmed={phase === 'paused'} />
    {phase === 'focus' && <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button"
      accessibilityLabel={`${session.task}, 집중 중, ${controls ? '조작 닫기' : '멈추거나 마치기'}`}
      accessibilityValue={{ text: `${progress}퍼센트 진행` }} onPress={() => setControls(open => !open)} />}
    <TopBar right={<View style={styles.chip}><Text style={styles.chipText}>{status}</Text></View>} />

    {phase === 'focus' || phase === 'paused' ? <View style={[styles.bottom, bottom]} pointerEvents="box-none">
      <Text style={styles.title} accessibilityRole="header">{session.task}</Text>
      <View accessibilityRole="progressbar" accessibilityLabel={phase === 'paused' ? '집중 잠시 멈춤' : '집중 중'}
        accessibilityValue={{ min: 0, max: 100, now: progress }}>
        <CircularTimer remaining={remaining / session.plannedMs} paused={phase === 'paused'} size={96} strokeWidth={10} />
      </View>
      {phase === 'paused' ? <Text style={styles.caption}>작업실도 같이 쉬고 있어요</Text>
        : !controls && <Text style={styles.caption}>화면을 누르면 멈추거나 마칠 수 있어요</Text>}
      {(controls || phase === 'paused') && <>
        <View style={styles.row}>
          {phase === 'paused' ? <Pill primary label="다시 집중" onPress={resume} /> : <Pill primary label="잠시 멈춤" onPress={pause} />}
          <Pill label="마침" accessibilityLabel="이번 집중 마침" onPress={finish} />
        </View>
        <LinkButton label={phase === 'paused' ? '슈퍼포커스 끄기' : '슈퍼포커스 끄기 · 집중은 계속'} onPress={onExit} />
      </>}
    </View>
    : phase === 'break' ? <View style={[styles.bottom, bottom, styles.tight]} pointerEvents="box-none">
      <Text style={[styles.title, styles.smallTitle]}>{session.task}</Text>
      <Text style={styles.breakTime} accessibilityLabel={`휴식 남은 시간 ${formatClock(breakRemaining * 1000)}`}>{formatClock(breakRemaining * 1000)}</Text>
      <Text style={styles.caption}>잠깐 쉬어가요. 어깨를 펴고 멀리 보기.</Text>
      <View style={styles.track} aria-hidden><View style={[styles.trackFill, { width: `${breakProgress * 100}%` }]} /></View>
      <View style={styles.row}>
        <Pill primary label="휴식 끝내기" onPress={finishBreak} />
        <Pill label="오늘은 여기까지" onPress={onToday} />
      </View>
    </View>
    : <View style={[styles.bottom, bottom, styles.tight]} pointerEvents="box-none">
      <View style={styles.pawBadge}><Paw size={38} /></View>
      <Text style={[styles.title, styles.doneTitle]} accessibilityRole="header">{breakFinished ? '휴식이 끝났어요.' : '집중 하나가 쌓였어요.'}</Text>
      <Text style={styles.task}>{session.task}</Text>
      <Text style={styles.caption}>{formatDuration(session.focusedMs)} 집중했어요 · 오늘 {Math.max(1, todayCount)}번째</Text>
      <View style={[styles.row, styles.doneRow]}>
        <Pill primary label="같은 일 한 번 더" onPress={onAgain} />
        <Pill label="다른 일 시작" onPress={onNew} />
      </View>
      <LinkButton label="오늘은 여기까지" onPress={onToday} />
    </View>}
  </View>
}

/** 처음 한 번 안내. 들어가기를 눌러야 다음부터 바로 열린다. */
export function SuperFocusIntro({ onEnter, onClose }: { onEnter: () => void; onClose: () => void }) {
  const insets = useSafeAreaInsets()
  const { reduced, active } = useMotionPreference()
  return <View style={styles.screen} accessibilityViewIsModal onAccessibilityEscape={onClose}>
    <Workroom moving={reduced === false && active} />
    <TopBar right={<Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none"><Path d="M4 4l10 10M14 4L4 14" stroke={CREAM} strokeWidth={1.8} strokeLinecap="round" /></Svg>
    </Pressable>} />
    <View style={[styles.bottom, { bottom: Math.max(insets.bottom, 16) + 16 }, styles.tight]}>
      <Text style={[styles.title, styles.introTitle]} accessibilityRole="header">고양이 작업실에서 집중해요</Text>
      <Text style={styles.body}>집중 화면이 고양이 작업실로 바뀌어요.{'\n'}할 일과 집중 흐름만 조용히 남겨둘게요.</Text>
      <View style={styles.hints}>
        <View style={styles.hint}><Text style={styles.hintChip}>화면 누르기</Text><Text style={styles.hintText}>잠시 멈춤 · 마침</Text></View>
        <View style={styles.hint}><Text style={styles.hintChip}>끄기</Text><Text style={styles.hintText}>슈퍼포커스를 꺼도 집중은 계속돼요</Text></View>
      </View>
      <View style={[styles.row, styles.introRow]}><Pill primary label="작업실 들어가기" onPress={onEnter} /></View>
      <LinkButton label="다음에 할게요" onPress={onClose} />
    </View>
  </View>
}

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: GROUND },
  dim: { backgroundColor: 'rgba(21,16,11,0.38)' },
  topBar: { position: 'absolute', left: 24, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  place: { color: CREAM, fontSize: 15, fontWeight: '500', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
  chip: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999, backgroundColor: 'rgba(20,16,12,0.5)', borderWidth: 1, borderColor: 'rgba(255,244,226,0.16)' },
  chipText: { color: CREAM, fontSize: 14, fontWeight: '500' },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,16,12,0.5)', borderWidth: 1, borderColor: 'rgba(255,244,226,0.16)' },
  bottom: { position: 'absolute', left: 24, right: 24, alignItems: 'center', gap: 16 },
  tight: { gap: 10 },
  title: { color: CREAM, fontSize: 24, lineHeight: 33, fontWeight: '500', letterSpacing: -0.6, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.55)', textShadowRadius: 14 },
  smallTitle: { fontSize: 22, lineHeight: 31 },
  doneTitle: { marginTop: 8, fontSize: 25, lineHeight: 34, fontWeight: '600' },
  introTitle: { fontSize: 26, lineHeight: 35, fontWeight: '600' },
  task: { color: CREAM, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  body: { color: 'rgba(255,244,226,0.82)', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  caption: { color: 'rgba(255,244,226,0.74)', fontSize: 13, letterSpacing: 1.5, textAlign: 'center' },
  breakTime: { color: CREAM, fontSize: 84, lineHeight: 90, fontWeight: '400', letterSpacing: -2, fontVariant: ['tabular-nums'], textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 20 },
  track: { width: 200, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,244,226,0.2)', marginTop: 4, marginBottom: 12, overflow: 'hidden' },
  trackFill: { height: 3, borderRadius: 2, backgroundColor: CREAM },
  row: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 6 },
  doneRow: { marginTop: 10 },
  introRow: { marginTop: 14 },
  pill: { flex: 1, minHeight: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  pillPrimary: { backgroundColor: '#E8C690' },
  pillSecondary: { backgroundColor: 'rgba(20,16,12,0.55)', borderWidth: 1, borderColor: 'rgba(255,244,226,0.24)' },
  pillText: { color: CREAM, fontSize: 16, fontWeight: '500', textAlign: 'center' },
  pillPrimaryText: { color: '#2B1E10', fontWeight: '600' },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  linkText: { color: 'rgba(255,244,226,0.78)', fontSize: 14, textDecorationLine: 'underline' },
  pawBadge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,16,12,0.55)', borderWidth: 1, borderColor: 'rgba(255,244,226,0.16)' },
  hints: { marginTop: 6, gap: 8, alignItems: 'center' },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintChip: { color: CREAM, fontSize: 12, paddingVertical: 2, paddingHorizontal: 9, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,244,226,0.3)', overflow: 'hidden' },
  hintText: { color: 'rgba(255,244,226,0.78)', fontSize: 13 },
  pressed: { opacity: 0.75 }
})
