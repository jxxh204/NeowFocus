import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AppState, Text, View } from 'react-native'
import { randomUUID } from 'expo-crypto'
import {
  EMPTY_STATE, focusReducer, parseFocusState, createSyncEnvelope, serializeFocusState, FocusReplicator,
  remainingOf, localDayKey, canSuggestFirstFocus, achievementForDay, focusCalendarDays, isFeedbackCompletion, breakAfterCompletion, restoreFocusBreak, type FocusBreak, type FocusAction, type FocusState, type SyncStatus
} from '@neowfocus/core'
import Native, { type NativeCapabilities } from '../../modules/neowfocus-native'
import { cancelCompletion, requestAlertPermission, scheduleCompletion, playCompletionFeedback } from './alerts'
import { useSettings } from './SettingsProvider'
import { storage } from './storage'
import { sessionAppearance, type SessionAppearance } from './timerStyle'

type FocusContextValue = {
  state: FocusState
  now: number
  breakRemaining: number
  breakFinished: boolean
  finishBreak(): void
  start(task: string, minutes: number): void
  pause(): void
  resume(): void
  finish(): void
  dismiss(): void
  deleteRecord(id: string): void
  undoDeleteRecord(id: string): void
  resolveConflict(sessionId: string): void
  firstSuggestionReady: boolean
  firstSuggestionDay?: string
  markFirstSuggestion(day: string): void
  syncStatus: SyncStatus
  syncError?: string
  calendarStatus: 'off' | 'waiting' | 'syncing' | 'synced' | 'error'
  calendarError?: string
  nativeError?: string
  capabilities: NativeCapabilities
  retrySync(): void
  completionFeedback(sessionId: string): void
}
const FocusContext = createContext<FocusContextValue | null>(null)
const NO_CAPABILITIES: NativeCapabilities = { widgets: false, liveActivities: false, cloudKit: false }

export function FocusProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const [state, setState] = useState<FocusState>(EMPTY_STATE)
  const [focusBreak, setFocusBreak] = useState<FocusBreak | null>(null)
  const breakQueue = useRef<Promise<void>>(Promise.resolve())
  const finishBreak = useCallback(() => {
    setFocusBreak(previous => previous ? {...previous, endsAt:null} : null)
  }, [])
  const stateRef = useRef(state)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const deviceRef = useRef<string | null>(null)
  const [now, setNow] = useState(Date.now)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('off')
  const [syncError, setSyncError] = useState<string>()
  const syncStatusRef = useRef<SyncStatus>('off')
  const [calendarStatus, setCalendarStatus] = useState<FocusContextValue['calendarStatus']>('off')
  const [calendarError, setCalendarError] = useState<string>()
  const [calendarRetry, setCalendarRetry] = useState(0)
  const calendarQueue = useRef<Promise<void>>(Promise.resolve())
  const [nativeError, setNativeError] = useState<string>()
  const [appActive, setAppActive] = useState(AppState.currentState === 'active')
  const replicator = useRef<FocusReplicator | null>(null)
  const nativeQueue = useRef<Promise<void>>(Promise.resolve())
  const nativeAppearance = useRef<SessionAppearance | null>(null)
  const storageQueue = useRef<Promise<void>>(Promise.resolve())
  const capabilities = useMemo(() => Native?.getCapabilities() ?? NO_CAPABILITIES, [])
  const current = state.current
  const breakMatches = current?.status === 'finished' && current.id === focusBreak?.sessionId
  const breakRemaining = breakMatches && settings.autoBreak && focusBreak?.endsAt
    ? Math.max(0, Math.ceil((focusBreak.endsAt - now) / 1000)) : 0
  const onBreak = breakRemaining > 0
  const breakFinished = Boolean(breakMatches && focusBreak?.endsAt && !onBreak)
  useEffect(() => {
    if (!deviceId) return
    breakQueue.current = breakQueue.current.catch(() => {}).then(() => storage.saveBreak(focusBreak))
    void breakQueue.current.catch(() => setNativeError('휴식 상태를 저장하지 못했어요. 저장 공간을 확인해 주세요.'))
  }, [focusBreak, deviceId])
  useEffect(() => { if (!settings.autoBreak) finishBreak() }, [settings.autoBreak, finishBreak])
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const pendingFeedback = useRef<{ id: string; timer: ReturnType<typeof setTimeout> } | undefined>(undefined)
  const foregroundSince = useRef(Date.now())
  const completionFeedback = useCallback((sessionId: string) => {
    if (pendingFeedback.current?.id !== sessionId) return
    clearTimeout(pendingFeedback.current.timer)
    pendingFeedback.current = undefined
    if (settingsRef.current.alerts && AppState.currentState === 'active') playCompletionFeedback()
  }, [])
  useEffect(() => () => {
    if (pendingFeedback.current) clearTimeout(pendingFeedback.current.timer)
  }, [])

  const save = useCallback((next: FocusState) => {
    const pending = storageQueue.current.catch(() => {}).then(() => storage.saveState(createSyncEnvelope(next)))
    storageQueue.current = pending
    pending.catch(() => setNativeError('기기에 저장하지 못했어요. 저장 공간을 확인해 주세요.'))
    return pending
  }, [])
  const apply = useCallback((next: FocusState) => {
    if (next === stateRef.current) return
    const previous = stateRef.current.current
    const current = next.current
    if (current?.status !== 'finished') setFocusBreak(null)
    else if (previous?.id === current.id && previous.status !== 'finished')
      setFocusBreak(breakAfterCompletion(current, settingsRef.current.autoBreak === true))
    if (deviceRef.current && settingsRef.current.alerts && AppState.currentState === 'active' && next.current
      && isFeedbackCompletion(previous, next.current, deviceRef.current, Date.now(), foregroundSince.current)) {
      if (pendingFeedback.current) clearTimeout(pendingFeedback.current.timer)
      const id = next.current.id
      pendingFeedback.current = { id, timer: setTimeout(() => completionFeedback(id), 650) }
    }
    stateRef.current = next
    setState(next)
    setNow(Date.now())
    if (deviceRef.current) void save(next)
  }, [save, completionFeedback])
  const dispatch = useCallback((action: FocusAction) => {
    apply(focusReducer(stateRef.current, action))
  }, [apply])
  const tick = useCallback(() => {
    const time = Date.now()
    setNow(time)
    dispatch({ type: 'tick', now: time })
  }, [dispatch])

  // Widget actions are durable until JS has saved them. Replay before settling an expired timer.
  const drainNativeCommands = useCallback(async () => {
    const id = deviceRef.current
    if (!Native || !id) return
    const commands = await Native.drainCommands()
    const nativeCommands = commands.map((command) => ({
      id: command.id, sessionId: command.sessionId, action: command.action,
      issuedAt: command.issuedAt, revision: command.revision,
      deviceId: command.snapshot.deviceId ?? id,
      ...(command.baseSessionJSON ? { baseSession: JSON.parse(command.baseSessionJSON) } : {})
    }))
    if (nativeCommands.some((command) => command.issuedAt > Date.now() + 60_000))
      throw new Error('위젯 변경 시각을 확인하지 못했어요. 기기 시간을 확인해 주세요.')
    if (commands.length) {
      const incoming = parseFocusState(JSON.stringify({ current: null, records: [], nativeCommands }))
      if (!incoming) throw new Error('위젯 변경을 읽지 못했어요. 앱을 다시 열어 주세요.')
      dispatch({ ...incoming, type: 'sync', now: Date.now() })
      await save(stateRef.current)
      // Original command logs now live in the durable common store before queue acknowledgement.
      const unresolved = nativeCommands.filter((command) => !command.baseSession
        && stateRef.current.current?.id === command.sessionId
        && (stateRef.current.current.revision ?? 0) < command.revision)
      await Native.acknowledgeCommands(commands.filter((command) => !unresolved.some((item) => item.id === command.id)).map((command) => command.id))
      if (unresolved.length) throw new Error('위젯 변경을 기다리고 있어요. 동기화 후 다시 확인해 주세요.')
    }
  }, [dispatch, save])
  const refresh = useCallback(() => {
    nativeQueue.current = nativeQueue.current.catch(() => {}).then(drainNativeCommands).then(() => {
      tick()
      void replicator.current?.sync()
    }).catch((error) => setNativeError(String(error)))
    return nativeQueue.current
  }, [drainNativeCommands, tick])

  useEffect(() => {
    let active = true
    Promise.all([storage.loadState<unknown>(), storage.deviceId(), storage.loadBreak()]).then(async ([saved, id, savedBreak]) => {
      if (!active) return
      const restored = saved ? parseFocusState(JSON.stringify(saved)) : null
      if (saved && !restored) setNativeError('저장된 데이터를 읽지 못했어요. 앱을 종료하고 다시 확인해 주세요.')
      // Do not overwrite an unreadable store with an empty state.
      if (saved && !restored) return
      stateRef.current = restored ?? EMPTY_STATE
      setState(stateRef.current)
      setFocusBreak(restoreFocusBreak(stateRef.current.current, savedBreak, settingsRef.current.autoBreak === true))
      deviceRef.current = id
      await drainNativeCommands().catch(() => setNativeError('위젯 변경을 확인하지 못했어요. 앱에서 다시 확인해 주세요.'))
      if (!active) return
      tick()
      setDeviceId(id)
    }).catch(() => setNativeError('집중 기록을 불러오지 못했어요. 앱을 다시 열어 주세요.'))
    return () => { active = false }
  }, [drainNativeCommands, tick])

  useEffect(() => {
    if (!deviceId || !settings.syncEnabled) {
      setSyncStatus('off')
      syncStatusRef.current = 'off'
      setSyncError(undefined)
      return
    }
    if (!Native || !capabilities.cloudKit) {
      setSyncStatus('offline')
      setSyncError('iCloud 동기화는 설치된 iOS 앱에서 사용할 수 있어요.')
      return
    }
    const native = Native
    const worker = new FocusReplicator({
      transport: {
        read: async () => {
          const account = await native.cloudAccountStatus()
          if (account !== 'available') throw new Error('iCloud 로그인을 확인해 주세요.')
          return native.cloudRead()
        },
        write: (json, tag) => native.cloudWrite(json, tag)
      },
      getState: () => stateRef.current,
      applyState: apply,
      onStatus: (status, message) => { syncStatusRef.current = status; setSyncStatus(status); setSyncError(message) }
    })
    replicator.current = worker
    void worker.sync()
    const listener = native.addListener('cloudChanged', () => { void refresh() })
    void native.cloudSubscribe().catch(() => setSyncError('변경 알림을 연결하지 못했어요. 앱을 다시 열면 동기화해요.'))
    return () => { listener.remove(); worker.stop(); if (replicator.current === worker) replicator.current = null }
  }, [deviceId, settings.syncEnabled, capabilities.cloudKit, apply])

  useEffect(() => { if (deviceId) void replicator.current?.sync() }, [state, deviceId])
  useEffect(() => {
    if (!deviceId || !settings.calendarSyncEnabled || !settings.syncEnabled) {
      setCalendarStatus('off'); setCalendarError(undefined)
      return
    }
    if (!Native?.getCapabilities().calendar) {
      setCalendarStatus('error'); setCalendarError('캘린더 연결을 지원하는 최신 iOS 앱을 설치해 주세요.')
      return
    }
    if (!appActive) return
    let canceled = false
    setCalendarStatus('waiting')
    calendarQueue.current = calendarQueue.current.catch(() => {}).then(async () => {
      if (canceled) return
      // Merge the complete iCloud history before publishing a daily aggregate.
      const worker = replicator.current
      if (!worker) return
      await worker.sync()
      if (canceled || replicator.current !== worker) return
      if (syncStatusRef.current !== 'synced') { setCalendarStatus('waiting'); return }
      setCalendarStatus('syncing')
      await Native!.calendarSync(JSON.stringify(focusCalendarDays(stateRef.current)))
      if (!canceled) { setCalendarStatus('synced'); setCalendarError(undefined) }
    }).catch(error => {
      if (!canceled) { setCalendarStatus('error'); setCalendarError(error instanceof Error ? error.message : String(error)) }
    })
    return () => { canceled = true }
  }, [deviceId, state.records, state.recordChanges, settings.calendarSyncEnabled, settings.syncEnabled, appActive, calendarRetry, syncStatus === 'synced'])
  useEffect(() => {
    if (!appActive || !settings.syncEnabled || syncStatus !== 'offline') return
    const retry = setInterval(() => { void refresh(); setCalendarRetry(value => value + 1) }, 30_000)
    return () => clearInterval(retry)
  }, [appActive, settings.syncEnabled, syncStatus, refresh])
  useEffect(() => {
    if (!appActive || (current?.status !== 'running' && !onBreak)) return
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [appActive, current?.status, onBreak, tick])
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      setAppActive(next === 'active')
      if (next === 'active') foregroundSince.current = Date.now()
      if (next === 'active') void refresh()
    })
    return () => subscription.remove()
  }, [refresh])

  // A shared deadline powers the widget and ActivityKit; no background JS timer is required.
  // Artwork can catch up while the app is visible and once when it backgrounds.
  // Suspended apps cannot promise recurring custom Live Activity artwork updates.
  const artworkMinute = appActive && current?.status === 'running' && settings.timerStyle !== 'classic'
    ? Math.floor(now / 60_000) : 0
  useEffect(() => {
    if (!deviceId || !Native) return
    nativeQueue.current = nativeQueue.current.catch(() => {}).then(() => drainNativeCommands().catch((error) => setNativeError(String(error)))).then(async () => {
      const session = stateRef.current.current
      const appearanceSettings = settingsRef.current
      nativeAppearance.current = sessionAppearance(nativeAppearance.current, session?.id ?? null,
        session?.status === 'running' || session?.status === 'paused', appearanceSettings.timerStyle)
      const conflict = Boolean(stateRef.current.conflicts?.length)
      const today = achievementForDay(stateRef.current.records, Date.now())
      await Native!.publishSnapshot(JSON.stringify({
        sessionId: session?.id ?? null,
        task: session?.task ?? '',
        status: conflict ? 'idle' : session?.status === 'finished' ? 'completed' : session?.status ?? 'idle',
        endsAt: session?.endsAt ?? null,
        remainingSeconds: session ? remainingOf(session, Date.now()) / 1000 : 0,
        durationSeconds: session ? session.plannedMs / 1000 : 0,
        revision: session?.revision ?? 0,
        updatedAt: session?.updatedAt ?? Date.now(),
        showTaskOnLockScreen: appearanceSettings.showTaskOnLockScreen,
        timerStyle: nativeAppearance.current.timerStyle,
        showRemainingTime: appearanceSettings.showRemainingTime,
        notifyOnCompletion: Boolean(session && appearanceSettings.alerts && !conflict && (session.startedBy ?? session.updatedBy) === deviceId),
        sharedStateJSON: serializeFocusState(stateRef.current),
        syncEnabled: appearanceSettings.syncEnabled,
        deviceId,
        suggestionEligible: canSuggestFirstFocus(stateRef.current, { now: Date.now(), syncEnabled: appearanceSettings.syncEnabled, syncReady: syncStatusRef.current === 'synced' }),
        defaultMinutes: appearanceSettings.defaultMinutes,
        todayDay: today.day, todayCount: today.count, todayFocusedSeconds: today.focusedMs / 1000
      }))
    }).catch((error) => setNativeError(String(error)))
  }, [state, deviceId, appActive, artworkMinute, settings.showTaskOnLockScreen, settings.timerStyle, settings.showRemainingTime, settings.alerts, settings.syncEnabled, settings.defaultMinutes, syncStatus, drainNativeCommands])

  const notificationQueue = useRef<Promise<void>>(Promise.resolve())
  const notificationId = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!deviceId) return
    notificationQueue.current = notificationQueue.current.catch(() => {}).then(async () => {
      if (notificationId.current) await cancelCompletion(notificationId.current)
      notificationId.current = undefined
      if (current?.status === 'running' && current.endsAt !== null && settings.alerts
        && !state.conflicts?.length && (current.startedBy ?? current.updatedBy) === deviceId) {
        await requestAlertPermission()
        if (stateRef.current.current?.id !== current.id || stateRef.current.current?.status !== 'running' || stateRef.current.current?.endsAt !== current.endsAt) return
        notificationId.current = current.id
        await scheduleCompletion({ id: current.id, task: settings.showTaskOnLockScreen ? current.task : '집중을 마쳤어요.',
          endsAt: current.endsAt, plannedMs: current.plannedMs })
      }
    })
    notificationQueue.current.catch(() => setNativeError('완료 알림을 예약하지 못했어요. 알림 권한을 확인해 주세요.'))
  }, [deviceId, current?.id, current?.status, current?.endsAt, state.conflicts?.length, settings.alerts, settings.showTaskOnLockScreen])

  const markFirstSuggestion = useCallback((day: string) => {
    if (deviceRef.current) dispatch({ type: 'decideFirstSuggestion', day, decision: 'skipped', now: Date.now(), deviceId: deviceRef.current })
  }, [dispatch])
  const value = useMemo<FocusContextValue>(() => {
    const at = () => ({ now: Date.now(), deviceId: deviceId ?? '' })
    return {
      state, now, breakRemaining, breakFinished, finishBreak, capabilities, syncStatus, syncError, calendarStatus, calendarError, nativeError, completionFeedback,
      start: (task, minutes) => {
        if (!task.trim() || !Number.isFinite(minutes) || minutes <= 0 || minutes > 180 || !deviceId) return
        dispatch({ type: 'start', id: randomUUID(), task, plannedMs: minutes * 60_000, ...at() })
        setNow(Date.now())
      },
      pause: () => dispatch({ type: 'pause', ...at() }),
      resume: () => { dispatch({ type: 'resume', ...at() }); setNow(Date.now()) },
      finish: () => dispatch({ type: 'finish', ...at() }),
      dismiss: () => { if (stateRef.current.current) completionFeedback(stateRef.current.current.id); dispatch({ type: 'dismiss' }) },
      deleteRecord: (id) => dispatch({ type: 'deleteRecord', id, ...at() }),
      undoDeleteRecord: (id) => dispatch({ type: 'undoDeleteRecord', id, ...at() }),
      resolveConflict: (sessionId) => dispatch({ type: 'resolveConflict', sessionId, ...at() }),
      firstSuggestionReady: !settings.syncEnabled || syncStatus === 'synced',
      firstSuggestionDay: state.firstSuggestions?.find((item) => item.day === localDayKey(Date.now()))?.day,
      markFirstSuggestion,
      retrySync: () => { void refresh(); setCalendarRetry(value => value + 1) }
    }
  }, [state, now, breakRemaining, breakFinished, finishBreak, deviceId, settings.alerts, settings.syncEnabled, syncStatus, syncError, calendarStatus, calendarError, nativeError, capabilities, dispatch, refresh, markFirstSuggestion, completionFeedback])

  // Keep storage failure visible rather than presenting an empty, apparently healthy app.
  if (!deviceId) return nativeError ? <View style={{ flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#272727' }}><Text accessibilityRole="alert" style={{ color: '#FFF' }}>{nativeError}</Text></View> : null
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}
export function useFocus() {
  const context = useContext(FocusContext)
  if (!context) throw new Error('useFocus는 FocusProvider 안에서 써야 합니다.')
  return context
}
