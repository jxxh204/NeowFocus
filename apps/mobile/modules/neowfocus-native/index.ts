import { requireOptionalNativeModule } from 'expo'

export type NativeFocusSnapshot = {
  sessionId: string | null
  task: string
  status: 'idle' | 'running' | 'paused' | 'completed'
  endsAt: number | null
  remainingSeconds: number
  durationSeconds: number
  revision: number
  updatedAt: number
  showTaskOnLockScreen: boolean
  timerStyle?: 'classic' | 'blocks' | 'water'
  showRemainingTime?: boolean
  notifyOnCompletion?: boolean
  sharedStateJSON?: string
  syncEnabled?: boolean
  deviceId?: string
  suggestionEligible?: boolean
  defaultMinutes?: number
  todayDay?: string
  todayCount?: number
  todayFocusedSeconds?: number
}
export type NativeFocusCommand = {
  id: string
  action: 'pause' | 'resume'
  sessionId: string
  issuedAt: number
  revision: number
  snapshot: NativeFocusSnapshot
  baseSessionJSON?: string
}
export type NativeCapabilities = {
  widgets: boolean
  liveActivities: boolean
  cloudKit: boolean
  calendar?: boolean
}
export type CloudState = { json: string | null; changeTag: string | null }
export interface NeowFocusNativeModule {
  playCompletionFeedback(): Promise<void>
  getCapabilities(): NativeCapabilities
  publishSnapshot(snapshotJSON: string): Promise<void>
  readSnapshot(): Promise<NativeFocusSnapshot | null>
  drainCommands(): Promise<NativeFocusCommand[]>
  acknowledgeCommands(ids: string[]): Promise<void>
  addListener(event: 'cloudChanged', listener: () => void): { remove(): void }
  cloudSubscribe(): Promise<void>
  cloudAccountStatus(): Promise<string>
  cloudRead(): Promise<CloudState>
  cloudWrite(json: string, expectedChangeTag: string | null): Promise<string>
  calendarConnect(): Promise<void>
  calendarSync(json: string): Promise<void>
}
// Expo Go and web intentionally return null; callers must expose unavailable capabilities.
export const NeowFocusNative = requireOptionalNativeModule<NeowFocusNativeModule>('NeowFocusNative')
export default NeowFocusNative
