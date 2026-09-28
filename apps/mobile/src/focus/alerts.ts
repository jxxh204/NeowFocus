import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'
import * as Notifications from 'expo-notifications'
import { formatDuration } from './format'

// 웹 미리보기에서는 알림·진동을 쓰지 않는다.
const native = Platform.OS !== 'web'

if (native) {
  // 앱을 보고 있을 때는 완료 화면이 대신 알려주므로 배너를 띄우지 않는다.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false
    })
  })
}

export async function requestAlertPermission() {
  if (!native) return
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') await Notifications.requestPermissionsAsync()
}

/** 세션 id를 알림 id로 써서, 같은 세션의 예약은 항상 하나만 남는다. */
export async function scheduleCompletion({
  id,
  task,
  endsAt,
  plannedMs
}: {
  id: string
  task: string
  endsAt: number
  plannedMs: number
}) {
  if (!native) return
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
  if (endsAt <= Date.now()) return
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title: `${formatDuration(plannedMs)} 집중했어요.`, body: task, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endsAt) }
  })
}

export async function cancelCompletion(id: string) {
  if (!native) return
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
}

export function vibrateCompletion() {
  if (!native) return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}
