import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FOCUS_MINUTES } from '@neowfocus/core'
import { color, radius } from '@/theme'

export function DurationChips({
  value,
  onChange
}: {
  value: number
  onChange: (minutes: number) => void
}) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {FOCUS_MINUTES.map((minutes) => {
        const selected = minutes === value
        return (
          <Pressable
            key={minutes}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(minutes)}
            style={[styles.chip, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{minutes}분</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selected: { backgroundColor: color.text, borderColor: color.text },
  label: { color: color.muted, fontSize: 15, fontWeight: '500' },
  selectedLabel: { color: color.primaryText, fontWeight: '600' }
})
