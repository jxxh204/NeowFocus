import { useState } from 'react'
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native'
import { groupRecordsByDay } from '@neowfocus/core'
import { useFocus } from '@/focus/FocusProvider'
import { formatDay, formatDuration } from '@/focus/format'
import { color } from '@/theme'

export function RecordsPanel({ day }: { day?: string } = {}) {
  const { state, deleteRecord, undoDeleteRecord } = useFocus()
  const [deleted, setDeleted] = useState<Array<{ id: string; task: string }>>([])
  const sections = groupRecordsByDay(state.records).filter(group => !day || group.day === day).map((group) => ({
    ...group,
    data: group.records
  }))

  return (
    <SectionList
      sections={sections}
      keyExtractor={(record) => record.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{day ? '이날의 집중 기록이 없어요. iCloud 동기화 상태를 확인해 주세요.' : '첫 집중을 마치면 여기에 남아요.'}</Text>
        </View>
      }
      ListHeaderComponent={deleted.length ? (
        <View style={styles.undoList}>
          {deleted.map(({ id, task }) => (
            <View key={id} style={styles.undoRow}>
              <Text style={styles.undoText} numberOfLines={2}>{task} 기록을 삭제했어요.</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${task} 기록 삭제 취소`}
                style={styles.textButton}
                onPress={() => {
                  undoDeleteRecord(id)
                  setDeleted((items) => items.filter((item) => item.id !== id))
                }}
              ><Text style={styles.undoAction}>실행 취소</Text></Pressable>
            </View>
          ))}
        </View>
      ) : null}
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
          <View style={styles.record}>
            <Text style={styles.task}>{item.task}</Text>
            <Text style={styles.duration}>
              {formatDuration(item.focusedMs)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.task} 기록 삭제`}
            style={styles.textButton}
            onPress={() => {
              deleteRecord(item.id)
              setDeleted((items) => [...items.filter((record) => record.id !== item.id), { id: item.id, task: item.task }])
            }}
          ><Text style={styles.deleteText}>삭제</Text></Pressable>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: color.muted, fontSize: 15 },
  dayHeader: { marginTop: 24, marginBottom: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'baseline' },
  day: { color: color.text, fontSize: 17, fontWeight: '600' },
  dayTotal: { color: color.muted, fontSize: 14 },
  row: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.line, flexDirection: 'row', alignItems: 'center', gap: 12 },
  record: { flex: 1, gap: 6 },
  task: { color: color.text, fontSize: 16, lineHeight: 23 },
  duration: { color: color.muted, fontSize: 14, fontVariant: ['tabular-nums'] },
  textButton: { minHeight: 44, minWidth: 44, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: color.muted, fontSize: 13 },
  undoList: { gap: 8, marginTop: 12 },
  undoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  undoText: { flex: 1, color: color.muted, fontSize: 14, lineHeight: 20 },
  undoAction: { color: color.text, fontSize: 14 }
})
