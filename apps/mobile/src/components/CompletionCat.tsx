import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Image, StyleSheet, View } from 'react-native'
import type { PawTarget } from './CompletionPaw'

import { catSheet as sheet, CAT_WIDTH as CANVAS_WIDTH, CAT_HEIGHT as CANVAS_HEIGHT,
  CAT_REGISTER_X as REGISTER_X, CAT_PAW_X as PAW_X, CAT_PAW_Y as PAW_Y,
  catEntryGeometry, type CatEntry } from './completionGeometry'
import { useMotionPreference } from './motionPreference'

const CAT_IMAGE = require('../../assets/completion-pixel/cat-stamp-pixel-v1.png')

// The printed sprite poses are registered at the cropped upper back, not the cell edges.
export function completionPixelFrame(value: number) {
  if (value < 0.36) return 0
  if (value < 0.4) return 1
  if (value < 0.46) return 2
  if (value < 0.63) return 3
  if (value < 0.665) return 4
  if (value < 0.69) return 6
  if (value < 0.72) return 5
  return 7
}

/** Day-end only: one entrance, a bounded sequence of counting presses, then departure. */
export function useDayEndMotion(id: string | undefined, ready: boolean, count: number, onCount: (value: number) => void) {
  const progress = useRef(new Animated.Value(0)).current
  const stamp = useRef(new Animated.Value(0)).current
  const consumed = useRef<string | undefined>(undefined)
  const countRef = useRef(onCount)
  countRef.current = onCount
  const { reduced, active } = useMotionPreference()
  useEffect(() => {
    if (!id) { consumed.current = undefined; progress.setValue(0); stamp.setValue(0); return }
    if (reduced === null || !ready) return
    if (consumed.current === id || reduced || !active || count === 0) {
      consumed.current = id; progress.setValue(1); stamp.setValue(1); countRef.current(count); return
    }
    consumed.current = id
    let cancelled = false
    let animation: Animated.CompositeAnimation | undefined
    const step = (value: Animated.Value, toValue: number, duration: number, easing = Easing.inOut(Easing.quad)) =>
      Animated.timing(value, { toValue, duration, easing, useNativeDriver: true, isInteraction: false })
    const run = (next: Animated.CompositeAnimation) => new Promise<boolean>(resolve => {
      animation = next; next.start(({ finished }) => resolve(finished && !cancelled))
    })
    const perform = async () => {
      progress.setValue(0); stamp.setValue(0); countRef.current(0)
      if (!await run(step(progress, 0.36, 600, Easing.out(Easing.cubic)))) return
      const steps = Math.min(30, count)
      const beat = Math.max(60, Math.min(300, Math.round(1800 / steps)))
      for (let i = 1; i <= steps; i++) {
        progress.setValue(0.36)
        if (!await run(step(progress, 0.46, beat * 0.3))) return
        stamp.setValue(0)
        if (!await run(Animated.parallel([step(progress, 0.53, beat * 0.2), step(stamp, 0.45, beat * 0.2)]))) return
        countRef.current(Math.ceil(i * count / steps))
        if (!await run(Animated.parallel([step(progress, 0.72, beat * 0.5), step(stamp, 1, beat * 0.5)]))) return
      }
      if (await run(step(progress, 1, 430, Easing.in(Easing.cubic)))) countRef.current(count)
    }
    void perform()
    return () => { cancelled = true; animation?.stop(); progress.setValue(1); stamp.setValue(1); countRef.current(count) }
  }, [id, ready, count, reduced, active, progress, stamp])
  return { progress, stamp }
}

export function CompletionCat({ target, progress, entry, viewport, onReady }: {
  target: PawTarget; progress: Animated.Value; entry: CatEntry; viewport: { width: number; height: number }; onReady: () => void
}) {
  const [frameIndex, setFrameIndex] = useState(0)
  useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      const next = completionPixelFrame(value)
      setFrameIndex(previous => previous === next ? previous : next)
    })
    return () => progress.removeListener(listener)
  }, [progress])
  const frame = sheet.frames[frameIndex]
  const { scale, dx, dy, angle, travel } = catEntryGeometry(entry, target, viewport)
  const side = CANVAS_HEIGHT * scale
  const movement = [travel, 20, 8, 0, 0, 12, travel]
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.overlay}>
      <Animated.View style={[
        styles.cat,
        { width: side, height: side, left: target.x - side / 2, top: target.y - side / 2,
          opacity: progress.interpolate({ inputRange: [0, 0.01, 0.99, 1], outputRange: [0, 1, 1, 0] }),
          transform: [{ translateX: progress.interpolate({
            inputRange: [0, 0.36, 0.46, 0.53, 0.63, 0.72, 1],
            outputRange: movement.map(distance => distance * dx)
          }) }, { translateY: progress.interpolate({
            inputRange: [0, 0.36, 0.46, 0.53, 0.63, 0.72, 1],
            outputRange: movement.map(distance => distance * dy)
          }) }, { rotate: `${angle}deg` }]
        }
      ]}>
        <View style={{ position: 'absolute', left: side / 2 - PAW_X * scale, top: side / 2 - PAW_Y * scale,
          width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale, overflow: 'hidden' }}><View style={{
          position: 'absolute', overflow: 'hidden',
          left: (REGISTER_X - frame.anchor.x) * scale, top: -frame.anchor.y * scale,
          width: frame.rect.width * scale, height: frame.rect.height * scale
        }}>
          <Image source={CAT_IMAGE} resizeMode="stretch" fadeDuration={0} onLoad={onReady} onError={onReady} style={{
            position: 'absolute', width: sheet.width * scale, height: sheet.height * scale,
            left: -frame.rect.x * scale, top: -frame.rect.y * scale
          }} />
        </View></View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  cat: { position: 'absolute' }
})
