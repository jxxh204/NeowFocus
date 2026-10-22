import { useEffect, useRef } from 'react'
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMotionPreference } from './motionPreference'

/** Only the two approved actions; tapping the surrounding canvas dismisses the sheet. */
export function FocusControlsSheet({ paused, onToggle, onFinish, onClose }: {
  paused: boolean; onToggle: () => void; onFinish: () => void; onClose: () => void
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
        <Pressable accessibilityRole="button" onPress={() => perform(onToggle)} style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>{paused ? '다시 집중' : '잠시 멈춤'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="이번 집중 마침" onPress={() => perform(onFinish)} style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>마침</Text>
        </Pressable>
      </Animated.View>
    </View>
  </Modal>
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.07)' },
  sheet: { paddingTop: 20, paddingHorizontal: 24, flexDirection: 'row', gap: 10,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: 'rgba(39,39,39,0.72)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: .2, shadowRadius: 14 },
  button: { flex: 1, minHeight: 52, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  primary: { backgroundColor: 'rgba(255,255,255,.94)' },
  secondary: { borderWidth: 1, borderColor: 'rgba(255,255,255,.22)', backgroundColor: 'rgba(39,39,39,.09)' },
  primaryText: { color: '#1b1b1b', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  secondaryText: { color: '#e0e0e0', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: .7 }
})
