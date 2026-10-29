import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { superFocusScene, useSettings, type SuperFocusCat, type SuperFocusRoom } from '@/focus/SettingsProvider'
import { color, radius } from '@/theme'
import { WORKROOM_STILL } from './SuperFocus'

const rooms: { id: SuperFocusRoom; title: string; description: string; image: number }[] = [
  { id: 'default', title: '기본 작업실', description: '처음 그린 작업실과 회색 고양이', image: WORKROOM_STILL },
  { id: 'nature', title: '햇살과 초록 폐허', description: '덩굴이 덮은 도시, 날리는 잎', image: require('../../assets/superfocus/worlds/room-nature.png') },
  { id: 'scrapyard', title: '폐차장 속 피난처', description: '쌓인 버스와 굴착기, 바람 먼지', image: require('../../assets/superfocus/worlds/room-scrapyard.png') }
]

const cats: { id: SuperFocusCat; title: string; image: number }[] = [
  { id: 'gray', title: '회색', image: require('../../assets/superfocus/worlds/cat-gray.png') },
  { id: 'british', title: '브리티시', image: require('../../assets/superfocus/worlds/cat-british.png') },
  { id: 'siamese', title: '샴', image: require('../../assets/superfocus/worlds/cat-siamese.png') },
  { id: 'maine', title: '메인쿤', image: require('../../assets/superfocus/worlds/cat-maine.png') }
]

/** 설정의 슈퍼포커스 작업실. 타이머 스타일과 같은 목록, 고양이는 기본 집중 시간과 같은 칩 */
export function SuperFocusSceneSettings() {
  const { settings, update } = useSettings()
  const { room, cat } = superFocusScene(settings)
  return <View style={styles.section}>
    <Text style={styles.heading}>슈퍼포커스 작업실</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="슈퍼포커스 작업실">
      {rooms.map(choice => <Pressable key={choice.id} accessibilityRole="radio"
        accessibilityLabel={`${choice.title}, ${choice.description}`} accessibilityState={{ checked: room === choice.id }}
        onPress={() => update({ superFocusRoom: choice.id })} style={({ pressed }) => [styles.choice, pressed && styles.pressed]}>
        <Image source={choice.image} style={styles.thumbnail} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={styles.copy}><Text style={styles.title}>{choice.title}</Text><Text style={styles.description}>{choice.description}</Text></View>
        <View style={[styles.radio, room === choice.id && styles.selected]}>
          {room === choice.id && <View style={styles.dot} />}
        </View>
      </Pressable>)}
    </View>
    <Text style={[styles.heading, styles.catHeading]}>고양이</Text>
    <View style={styles.cats} accessibilityRole="radiogroup" accessibilityLabel="고양이">
      {cats.map(choice => {
        const selected = cat === choice.id
        const disabled = room === 'default' && choice.id !== 'gray'
        return <Pressable key={choice.id} accessibilityRole="radio" accessibilityLabel={`${choice.title} 고양이`}
          accessibilityState={{ checked: selected, disabled }} disabled={disabled}
          onPress={() => update({ superFocusCat: choice.id })} style={[styles.cat, selected && styles.catSelected, disabled && styles.disabled]}>
          <Image source={choice.image} style={styles.catImage} resizeMode="contain" accessibilityIgnoresInvertColors />
          <Text style={[styles.catLabel, selected && styles.catLabelSelected]}>{choice.title}</Text>
        </Pressable>
      })}
    </View>
    <Text style={styles.note}>{room === 'default'
      ? '기본 작업실에는 회색 고양이가 함께 그려져 있어요. 다른 고양이는 다른 작업실에서 고를 수 있어요.'
      : '슈퍼포커스를 열면 고른 작업실에서 집중해요.'}</Text>
  </View>
}

const styles = StyleSheet.create({
  section: { marginTop: 8 },
  heading: { color: color.muted, fontSize: 14, marginBottom: 16 },
  catHeading: { marginTop: 20, marginBottom: 12 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderTopColor: color.line, borderTopWidth: StyleSheet.hairlineWidth },
  thumbnail: { width: 80, height: 45, borderRadius: 8 },
  copy: { flex: 1, minWidth: 0, gap: 5 },
  title: { color: color.text, fontSize: 17, fontWeight: '600' },
  description: { color: color.muted, fontSize: 14, lineHeight: 20 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#838383', alignItems: 'center', justifyContent: 'center' },
  selected: { borderColor: '#e0e0e0' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#e0e0e0' },
  cats: { flexDirection: 'row', gap: 8 },
  cat: { flex: 1, minHeight: 72, borderRadius: radius.control, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line,
    backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 },
  catSelected: { backgroundColor: color.text, borderColor: color.text },
  disabled: { opacity: 0.35 },
  catImage: { width: 56, height: 28 },
  catLabel: { color: color.muted, fontSize: 13, fontWeight: '500' },
  catLabelSelected: { color: color.primaryText, fontWeight: '600' },
  note: { color: color.muted, fontSize: 14, lineHeight: 21, marginTop: 12, marginBottom: 8 },
  pressed: { opacity: 0.65 }
})
