import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { color } from '@/theme'
import { PRIVACY_SECTIONS, PRIVACY_UPDATED, SUPPORT_EMAIL, SUPPORT_URL } from './privacyPolicy'

export function openSupport() {
  void Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {
    Alert.alert('문의하기', `메일 앱을 열 수 없어요. ${SUPPORT_EMAIL}로 문의해 주세요.`)
  })
}

export function PrivacyPanel({ onBack }: { onBack(): void }) {
  return <ScrollView contentContainerStyle={styles.content}>
    <Pressable accessibilityRole="button" onPress={onBack} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <Text style={styles.action}>설정으로 돌아가기</Text>
    </Pressable>
    <Text accessibilityRole="header" style={styles.title}>개인정보처리방침</Text>
    <Text style={styles.updated}>마지막 업데이트: {PRIVACY_UPDATED}</Text>
    {PRIVACY_SECTIONS.map(section => <View key={section.title} style={styles.section}>
      <Text accessibilityRole="header" style={styles.heading}>{section.title}</Text>
      <Text style={styles.body}>{section.body}</Text>
    </View>)}
    <Pressable accessibilityRole="link" onPress={openSupport} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <Text style={styles.action}>문의하기 · {SUPPORT_EMAIL}</Text>
    </Pressable>
    <Pressable accessibilityRole="link" onPress={() => {
      void Linking.openURL(SUPPORT_URL).catch(() => Alert.alert('지원 페이지', '페이지를 열지 못했어요. 잠시 후 다시 시도해 주세요.'))
    }} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <Text style={styles.action}>지원 페이지 열기</Text>
    </Pressable>
  </ScrollView>
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 40, gap: 16 },
  title: { color: color.text, fontSize: 22, fontWeight: '600' },
  updated: { color: color.muted, fontSize: 14 },
  section: { gap: 8, marginTop: 8 },
  heading: { color: color.text, fontSize: 17, fontWeight: '600' },
  body: { color: color.text, fontSize: 16, lineHeight: 25 },
  link: { minHeight: 44, justifyContent: 'center', paddingVertical: 10 },
  action: { color: color.text, fontSize: 15, textDecorationLine: 'underline' },
  pressed: { opacity: 0.65 }
})
