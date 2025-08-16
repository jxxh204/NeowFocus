export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0
  return Math.max(0, Math.min(100, (current / total) * 100))
}

export const getTimeRemaining = (duration: number, elapsed: number): number => {
  return Math.max(0, duration - elapsed)
}

export const isTimerExpired = (timeLeft: number): boolean => {
  return timeLeft <= 0
}