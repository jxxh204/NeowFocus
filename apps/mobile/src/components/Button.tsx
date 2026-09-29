import { Pressable, StyleSheet, Text } from 'react-native'
import { color, radius } from '@/theme'

type Props = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'subtle'
  disabled?: boolean
}

export function Button({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const primary = variant === 'primary'
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.subtle,
        disabled && styles.disabled,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.label, { color: primary ? color.primaryText : color.text }]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  primary: { backgroundColor: color.timer },
  subtle: {
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line
  },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.75 },
  label: { fontSize: 16, fontWeight: '600' }
})
