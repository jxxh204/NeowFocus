import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { color } from '@/theme'

/** A temporary panel over the focus canvas; it never changes the app's route. */
export function SecondarySheet({
  title,
  visible,
  onClose,
  children
}: {
  title: string
  visible: boolean
  onClose: () => void
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onDismiss={onClose}
    >
      <View
        style={[styles.sheet, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        accessibilityViewIsModal
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={`${title} 닫기`}
            style={styles.close}
          >
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: color.bg },
  header: {
    minHeight: 60,
    paddingLeft: 24,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: color.line,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  title: { flex: 1, color: color.text, fontSize: 19, fontWeight: '600' },
  close: { minWidth: 54, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: color.text, fontSize: 16 }
})
