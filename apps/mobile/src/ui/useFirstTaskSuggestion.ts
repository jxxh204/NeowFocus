import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { canSuggestFirstFocus, type FocusState } from '@neowfocus/core'

const KEY = 'neowfocus.firstTaskSuggestion.day.v1'
export const FIRST_TASK = '오늘 할 일 생각해보기'
export const FIRST_TASK_MINUTES = 5

export function localDay(at = Date.now()) {
  const date = new Date(at)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** A date alone is shared, never a task list. This local fallback also works offline. */
export function useFirstTaskSuggestion({
  state,
  confirmed,
  sharedDay,
  markDay
}: {
  state: FocusState
  confirmed: boolean
  sharedDay?: string
  markDay: (day: string) => void
}) {
  const [visible, setVisible] = useState(false)
  const [evaluated, setEvaluated] = useState(false)
  const [savedDay, setSavedDay] = useState<string | null | undefined>(undefined)
  const entryTime = useRef(Date.now())
  const entryDay = useRef(localDay(entryTime.current))
  const considered = useRef(false)
  const interrupted = useRef(false)
  const consumed = useRef(false)

  const rememberDay = useCallback(() => {
    if (consumed.current) return
    consumed.current = true
    const day = entryDay.current
    AsyncStorage.setItem(KEY, day).catch(() => {})
    markDay(day)
  }, [markDay])

  useEffect(() => {
    let active = true
    AsyncStorage.getItem(KEY)
      .then((day) => { if (active) setSavedDay(day) })
      // With unreadable storage, avoid repeatedly guessing that this is the first visit.
      .catch(() => { if (active) setSavedDay(entryDay.current) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (considered.current || interrupted.current || savedDay === undefined || !confirmed) return
    considered.current = true
    setEvaluated(true)
    const day = entryDay.current
    if (!canSuggestFirstFocus(state, { now: entryTime.current }) || savedDay === day || sharedDay === day) return
    setVisible(true)
    rememberDay()
  }, [confirmed, savedDay, sharedDay, state, rememberDay])

  // Losing the verified view never shows a "first task" claim from stale remote data.
  const dismiss = useCallback(() => {
    interrupted.current = true
    setVisible(false)
    setEvaluated(true)
    rememberDay()
  }, [rememberDay])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') dismiss()
    })
    return () => sub.remove()
  }, [dismiss])

  // Exclude our own display decision here, but keep live/archived (deleted) records and conflicts.
  const remainsEligible = canSuggestFirstFocus({ ...state, firstSuggestions: [] }, { now: entryTime.current })
  return { visible: visible && confirmed && remainsEligible, evaluated, dismiss }
}
