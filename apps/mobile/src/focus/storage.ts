import AsyncStorage from '@react-native-async-storage/async-storage'
import { randomUUID } from 'expo-crypto'

const KEYS = {
  state: 'neowfocus.focus.v1',
  settings: 'neowfocus.settings.v1',
  deviceId: 'neowfocus.deviceId'
} as const

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {})
}

export const storage = {
  loadState: <T>() => readJson<T>(KEYS.state),
  saveState: (value: unknown) => writeJson(KEYS.state, value),
  loadSettings: <T>() => readJson<T>(KEYS.settings),
  saveSettings: (value: unknown) => writeJson(KEYS.settings, value),

  /** 기기 id는 한 번 만들어 계속 쓴다. 동기화 시 누가 바꿨는지 가리는 데 쓴다. */
  async deviceId(): Promise<string> {
    const saved = await AsyncStorage.getItem(KEYS.deviceId).catch(() => null)
    if (saved) return saved
    const id = randomUUID()
    await AsyncStorage.setItem(KEYS.deviceId, id).catch(() => {})
    return id
  }
}
