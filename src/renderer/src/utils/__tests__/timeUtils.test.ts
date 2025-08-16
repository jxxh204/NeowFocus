import { formatTime, calculateProgress, getTimeRemaining, isTimerExpired } from '../timeUtils'

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('should format seconds to MM:SS format', () => {
      expect(formatTime(0)).toBe('00:00')
      expect(formatTime(59)).toBe('00:59')
      expect(formatTime(60)).toBe('01:00')
      expect(formatTime(90)).toBe('01:30')
      expect(formatTime(1500)).toBe('25:00')
      expect(formatTime(3661)).toBe('61:01')
    })

    it('should pad single digits with zero', () => {
      expect(formatTime(5)).toBe('00:05')
      expect(formatTime(65)).toBe('01:05')
    })
  })

  describe('calculateProgress', () => {
    it('should calculate progress percentage correctly', () => {
      expect(calculateProgress(0, 100)).toBe(0)
      expect(calculateProgress(25, 100)).toBe(25)
      expect(calculateProgress(50, 100)).toBe(50)
      expect(calculateProgress(100, 100)).toBe(100)
    })

    it('should handle division by zero', () => {
      expect(calculateProgress(50, 0)).toBe(0)
    })

    it('should clamp values between 0 and 100', () => {
      expect(calculateProgress(-10, 100)).toBe(0)
      expect(calculateProgress(150, 100)).toBe(100)
    })

    it('should handle decimal values', () => {
      expect(calculateProgress(33, 100)).toBe(33)
      expect(calculateProgress(750, 1500)).toBe(50)
    })
  })

  describe('getTimeRemaining', () => {
    it('should calculate remaining time correctly', () => {
      expect(getTimeRemaining(100, 0)).toBe(100)
      expect(getTimeRemaining(100, 30)).toBe(70)
      expect(getTimeRemaining(100, 100)).toBe(0)
    })

    it('should not return negative values', () => {
      expect(getTimeRemaining(100, 150)).toBe(0)
      expect(getTimeRemaining(50, 100)).toBe(0)
    })
  })

  describe('isTimerExpired', () => {
    it('should return true when time is zero or less', () => {
      expect(isTimerExpired(0)).toBe(true)
      expect(isTimerExpired(-1)).toBe(true)
      expect(isTimerExpired(-100)).toBe(true)
    })

    it('should return false when time is positive', () => {
      expect(isTimerExpired(1)).toBe(false)
      expect(isTimerExpired(60)).toBe(false)
      expect(isTimerExpired(1500)).toBe(false)
    })
  })
})