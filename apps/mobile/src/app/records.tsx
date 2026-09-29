import { SectionList, StyleSheet, Text, View } from 'react-native'
import { groupRecordsByDay } from '@neowfocus/core'
import { useFocus } from '@/focus/FocusProvider'
import { formatDay, formatDuration } from '@/focus/format'
import { color } from '@/theme'

export default function RecordsScreen() {
  const { state } = useFocus()
  const sections = groupRecordsByDay(state.records).map((group) => ({
    ...group,
    data: group.records
  }))

  if (sections.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>첫 집중을 마치면 여기에 남아요.</Text>
      </View>
    )
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(record) => record.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <View style={styles.dayHeader}>
          <Text style={styles.day}>{formatDay(section.day)}</Text>
          <Text style={styles.dayTotal}>
            {section.records.length}번 · {formatDuration(section.focusedMs)}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.task} numberOfLines={2}>
            {item.task}
          </Text>
          <Text style={styles.duration}>
            {formatDuration(item.focusedMs)}
            {item.completed ? '' : ' · 일찍 마침'}
          </Text>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 24, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: color.muted, fontSize: 15 },
  dayHeader: {
    marginTop: 24,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  day: { color: color.text, fontSize: 17, fontWeight: '600' },
  dayTotal: { color: color.muted, fontSize: 14 },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  task: { flex: 1, color: color.text, fontSize: 16 },
  duration: { color: color.muted, fontSize: 15, fontVariant: ['tabular-nums'] }
})
