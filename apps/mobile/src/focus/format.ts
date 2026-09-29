/** 집중한 시간을 사람이 읽는 말로: 40초, 25분, 1시간 5분 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}초`
  const totalMinutes = Math.floor(totalSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}분`
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`
}

const WEEKDAYS = '일월화수목금토'

/** YYYY-MM-DD를 오늘·어제·9월 27일 (토)로 */
export function formatDay(day: string, today = new Date()): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number]
  const date = new Date(y, m - 1, d)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((start.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  const label = `${m}월 ${d}일 (${WEEKDAYS[date.getDay()]})`
  return y === today.getFullYear() ? label : `${y}년 ${label}`
}
