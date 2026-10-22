import { memo, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import type { TimerStyle } from '@/focus/timerStyle'
import { useMotionPreference } from '../motionPreference'
import { BLOCK_PLAN, COLS, ROWS, WAVE_SPEED, blockCount, waterPaths, type BlockPiece } from './geometry'

/** Local 30fps clock: no timer-state writes, no time lost when the app backgrounds. */
function useSceneClock(enabled: boolean) {
  const [seconds, setSeconds] = useState(0)
  const clock = useRef(0)
  useEffect(() => {
    if (!enabled) return
    let frame = 0
    let previous: number | undefined
    let painted = 0
    const tick = (now: number) => {
      if (previous !== undefined) clock.current += Math.min(100, now - previous) / 1000
      previous = now
      if (now - painted >= 1000 / 30) { setSeconds(clock.current); painted = now }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled])
  return seconds
}

export function TimerScene({ style, progress, running }: { style: TimerStyle; progress: number; running: boolean }) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const { active, reduced } = useMotionPreference()
  if (style !== 'water' && style !== 'blocks') return null
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={styles.scene} onLayout={event => setSize(event.nativeEvent.layout)}>
    {size.width > 0 && (style === 'water'
      ? <Water {...size} progress={progress} moving={running && active && reduced === false} reduced={reduced !== false} />
      : style === 'blocks' ? <Blocks {...size} progress={progress} moving={running && active && reduced === false} /> : null)}
  </View>
}

function Water({ width, height, progress, moving, reduced }: { width: number; height: number; progress: number; moving: boolean; reduced: boolean }) {
  const seconds = useSceneClock(moving && progress > 0 && progress < 1)
  const paths = waterPaths(width, height, progress, seconds * WAVE_SPEED, reduced)
  if (progress <= 0) return null
  return <Svg width={width} height={height}>
    <Defs>
      <LinearGradient id="waterRear" x1="0" y1={paths.level} x2="0" y2={height} gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#88a6b1" stopOpacity={.50} /><Stop offset="1" stopColor="#405e6b" stopOpacity={.38} />
      </LinearGradient>
      <LinearGradient id="waterFront" x1="0" y1={paths.level} x2="0" y2={height} gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#526d78" /><Stop offset="1" stopColor="#304a56" />
      </LinearGradient>
    </Defs>
    <Path d={paths.rear.fill} fill="url(#waterRear)" /><Path d={paths.rear.edge} fill="none" stroke="#bdd1da" strokeOpacity={.33} strokeWidth={1} />
    <Path d={paths.front.fill} fill="url(#waterFront)" /><Path d={paths.front.edge} fill="none" stroke="#a8c2c7" strokeOpacity={.50} strokeWidth={1.5} />
  </Svg>
}

function Blocks({ width, height, progress, moving }: { width: number; height: number; progress: number; moving: boolean }) {
  const count = blockCount(progress)
  const previous = useRef(count)
  const [fall, setFall] = useState<{ index: number; start: number } | null>(null)
  const seconds = useSceneClock(moving && fall !== null)
  const clock = useRef(seconds)
  clock.current = seconds
  useEffect(() => {
    // Theme changes, restored sessions and foreground catch-up render directly at their true progress.
    setFall(count === previous.current + 1 && moving ? { index: count - 1, start: clock.current } : null)
    previous.current = count
  }, [count, moving])
  useEffect(() => { if (fall && seconds - fall.start >= .82) setFall(null) }, [seconds, fall])
  const unit = Math.max(width / COLS, height / ROWS)
  const age = fall ? seconds - fall.start : 1
  const t = Math.min(1, age / .62)
  return <Svg width={width} height={height}>
    <G x={(width - COLS * unit) / 2} y={height - ROWS * unit}>
      {BLOCK_PLAN.slice(0, count).map((piece, index) => <Piece key={index} piece={piece} unit={unit}
        y={fall?.index === index ? -4 + (piece.y + 4) * t * t : piece.y}
        bright={fall?.index === index && age < .74} />)}
    </G>
  </Svg>
}

const Piece = memo(function Piece({ piece, unit, y, bright }: { piece: BlockPiece; unit: number; y: number; bright: boolean }) {
  return <G>{piece.cells.map(([dx, dy], index) => {
    const x = (piece.x + dx) * unit + .9
    const top = (y + dy) * unit + .9
    return <G key={index}><Rect x={x} y={top} width={unit - 1.8} height={unit - 1.8} rx={1.6} fill={bright ? '#c7ccc5' : piece.tone} />
      <Rect x={x + 1} y={top + 1} width={unit - 3.8} height={1} fill="#ffffff" fillOpacity={.05} /></G>
  })}</G>
})
const styles = StyleSheet.create({ scene: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' } })
