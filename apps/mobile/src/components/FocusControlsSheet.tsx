import { useEffect, useRef } from 'react'
import { Animated, Easing, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { useMotionPreference } from './motionPreference'
import { WORKROOM_STILL } from './SuperFocus'

/** The two approved actions, plus a way into Super Focus; tapping the surrounding canvas dismisses the sheet. */
export function FocusControlsSheet({ paused, onToggle, onFinish, onClose, onSuperFocus }: {
  paused: boolean; onToggle: () => void; onFinish: () => void; onClose: () => void; onSuperFocus?: () => void
}) {
  const insets = useSafeAreaInsets()
  const { reduced } = useMotionPreference()
  const position = useRef(new Animated.Value(180)).current
  useEffect(() => {
    if (reduced === null) return
    if (reduced) { position.setValue(0); return }
    position.setValue(180)
    const animation = Animated.timing(position, { toValue: 0, duration: 220, easing: Easing.out(Easing.exp), useNativeDriver: true })
    animation.start()
    return () => animation.stop()
  }, [reduced, position])
  const perform = (action: () => void) => { onClose(); action() }
  return <Modal transparent visible animationType="none" presentationStyle="overFullScreen"
    statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
    <View style={styles.overlay} accessibilityViewIsModal onAccessibilityEscape={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="타이머 조작 닫기" accessibilityRole="button" />
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(24, insets.bottom + 12), transform: [{ translateY: position }] }]}>
        {onSuperFocus && <Pressable accessibilityRole="button" accessibilityLabel="슈퍼포커스로 보기, 고양이 작업실에서 집중해요"
          onPress={() => perform(onSuperFocus)} style={({ pressed }) => [styles.superFocus, pressed && styles.pressed]}>
          <Image source={WORKROOM_STILL} style={styles.thumbnail} resizeMode="cover" accessibilityIgnoresInvertColors />
          <View style={styles.superFocusText}>
            <Text style={styles.superFocusTitle}>슈퍼포커스로 보기</Text>
            <Text style={styles.superFocusNote}>고양이 작업실에서 집중해요</Text>
          </View>
          <Svg width={16} height={16} viewBox="0 0 16 16" fill="none"><Path d="M6 3l5 5-5 5" stroke="#C4C4C4" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </Pressable>}
        <View style={styles.row}>
          <Pressable accessibilityRole="button" onPress={() => perform(onToggle)} style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>{paused ? '다시 집중' : '잠시 멈춤'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="이번 집중 마침" onPress={() => perform(onFinish)} style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}>
            <Text style={styles.secondaryText}>마침</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  </Modal>
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.07)' },
  sheet: { paddingTop: 20, paddingHorizontal: 24, gap: 12,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: 'rgba(39,39,39,0.72)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: .2, shadowRadius: 14 },
  row: { flexDirection: 'row', gap: 10 },
  superFocus: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingLeft: 12, paddingRight: 14,
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.14)', backgroundColor: 'rgba(255,255,255,.05)' },
  thumbnail: { width: 72, height: 48, borderRadius: 8 },
  superFocusText: { flex: 1, gap: 2 },
  superFocusTitle: { color: 'rgba(255,255,255,.92)', fontSize: 15, fontWeight: '600' },
  superFocusNote: { color: 'rgba(255,255,255,.6)', fontSize: 12 },
  button: { flex: 1, minHeight: 52, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  primary: { backgroundColor: 'rgba(255,255,255,.94)' },
  secondary: { borderWidth: 1, borderColor: 'rgba(255,255,255,.22)', backgroundColor: 'rgba(39,39,39,.09)' },
  primaryText: { color: '#1b1b1b', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  secondaryText: { color: '#e0e0e0', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: .7 }
})
