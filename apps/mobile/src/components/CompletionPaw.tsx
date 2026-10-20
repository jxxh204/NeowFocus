import { useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import Svg, { Rect } from 'react-native-svg'
import { STAMP_ROTATION } from './completionGeometry'
import { PIXEL_PAW_ROWS } from '../../assets/completion-pixel/paw-mask'
import { color } from '@/theme'

export type PawTarget = { x: number; y: number }

function PixelPaw() {
  return <Svg width={52} height={52} viewBox="0 0 16 16" aria-hidden>
    {PIXEL_PAW_ROWS.flatMap((row, y) => [...row].map((pixel, x) => pixel === '1'
      ? <Rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="white" /> : null))}
  </Svg>
}

/** Keep the landing point in the normal layout; the cat moves over the screen. */
export function CompletionPaw({ progress, onTarget, placed = false, rotation = STAMP_ROTATION }: {
  progress: Animated.Value
  onTarget?: (target: PawTarget) => void
  placed?: boolean
  rotation?: number
}) {
  const marker = useRef<View>(null)
  return (
    <View
      ref={marker}
      collapsable={false}
      onLayout={() => marker.current?.measureInWindow((x, y, width, height) => {
        onTarget?.({ x: x + width / 2, y: y + height / 2 })
      })}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.paw}
    >
      <Animated.View style={{
        opacity: placed ? progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.78, 1, 1] })
          : progress.interpolate({ inputRange: [0, 0.12, 0.2, 1], outputRange: [0, 0, 1, 1] }),
        transform: [{ scale: progress.interpolate({ inputRange: [0, 0.2, 0.45, 0.7, 1], outputRange: [1.14, 0.94, 1.04, 1, 1] }) }, { rotate: `${rotation}deg` }]
      }}>
        <PixelPaw />
      </Animated.View>
    </View>
  )
}
const styles = StyleSheet.create({ paw: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface } })
