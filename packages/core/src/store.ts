import { toRecord, type FocusRecord } from './records'
import { mergeCurrent, mergeRecords } from './sync'
import {
  finishFocus,
  pauseFocus,
  resumeFocus,
  settleFocus,
  startFocus,
  type FocusSession
} from './session'

/**
 * 앱 전체의 집중 상태. 진행 중인 집중은 언제나 하나뿐이다.
 * current가 finished면 완료 화면을 보여주는 중이고, dismiss하면 null로 돌아간다.
 */
export type FocusState = {
  current: FocusSession | null
  records: FocusRecord[]
  /** 다른 기기의 집중에 밀려 마친 집중. 알린 뒤 ackDisplaced로 지운다. */
  displaced?: FocusSession | null
}

export type FocusAction =
  | { type: 'start'; id: string; task: string; plannedMs: number; now: number; deviceId: string }
  | { type: 'pause'; now: number; deviceId: string }
  | { type: 'resume'; now: number; deviceId: string }
  | { type: 'finish'; now: number; deviceId: string }
  | { type: 'tick'; now: number }
  | { type: 'dismiss' }
  /** 다른 기기에서 받은 상태를 합친다 */
  | { type: 'sync'; current: FocusSession | null; records: FocusRecord[]; now: number }
  | { type: 'ackDisplaced' }

export const EMPTY_STATE: FocusState = { current: null, records: [] }

export function isActive(session: FocusSession | null): session is FocusSession {
  return session !== null && session.status !== 'finished'
}

export function focusReducer(state: FocusState, action: FocusAction): FocusState {
  const { current } = state

  switch (action.type) {
    case 'start':
      if (isActive(current)) return state
      return { ...state, current: startFocus(action) }
    case 'dismiss':
      return current?.status === 'finished' ? { ...state, current: null } : state
    case 'ackDisplaced':
      return state.displaced ? { ...state, displaced: null } : state
    case 'sync': {
      const merged = mergeCurrent(current, action.current, action.now)
      const records = [merged.current, merged.displaced].reduce(
        (list, s) => withRecord(list, s ? toRecord(s) : null),
        mergeRecords(state.records, action.records)
      )
      return { current: merged.current, records, displaced: merged.displaced ?? state.displaced }
    }
  }

  if (!current) return state
  const next = transition(current, action)
  if (next === current) return state

  return { ...state, current: next, records: withRecord(state.records, toRecord(next)) }
}

function withRecord(records: FocusRecord[], record: FocusRecord | null): FocusRecord[] {
  return record && !records.some((r) => r.id === record.id) ? [...records, record] : records
}

function transition(
  session: FocusSession,
  action: Exclude<FocusAction, { type: 'start' | 'dismiss' | 'sync' | 'ackDisplaced' }>
) {
  switch (action.type) {
    case 'pause':
      return pauseFocus(session, action.now, action.deviceId)
    case 'resume':
      return resumeFocus(session, action.now, action.deviceId)
    case 'finish':
      return finishFocus(session, action.now, action.deviceId)
    case 'tick':
      return settleFocus(session, action.now)
  }
}
