import { Redirect, useLocalSearchParams } from 'expo-router'

/** Calendar's ownership URL also opens the corresponding focus list. */
export default function DailyFocusLink() {
  const { day } = useLocalSearchParams<{ day?: string }>()
  return <Redirect href={{ pathname: '/', params: { panel: 'records', recordDay: /^\d{4}-\d{2}-\d{2}$/.test(day ?? '') ? day : undefined } }} />
}
