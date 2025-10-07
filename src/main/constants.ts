// 윈도우 크기 상수
export const WINDOW_SIZE = {
  DEFAULT_WIDTH: 402,
  DEFAULT_HEIGHT: 162, // input 페이지: 30 + 84 + 48 = 162
  MIN_HEIGHT: 35,
  MAX_HEIGHT: 900
} as const

// IPC 채널
export const IPC_CHANNELS = {
  WINDOW_SIZE_CHANGE: 'WINDOW_SIZE_CHANGE',
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_MOVE: 'window-move',
  WINDOW_SET_POSITION: 'window-set-position',
  WINDOW_GET_POSITION: 'window-get-position',
  BROWSER_WINDOW_BLUR: 'browser-window-blur',
  PING: 'ping'
} as const

// 단축키
export const SHORTCUTS = {
  CLOSE_WINDOW: 'CommandOrControl+W',
  RELOAD: 'CommandOrControl+R',
  REFRESH: 'F5'
} as const

// 앱 설정
export const APP_CONFIG = {
  USER_MODEL_ID: 'com.electron',
  ICON_PATH: '../../build/icon.png',
  PRELOAD_PATH: '../preload/index.js',
  RENDERER_PATH: '../renderer/index.html',
  THEME: 'dark',
  VIBRANCY: 'under-window',
  VISUAL_EFFECT_STATE: 'active'
} as const

// 윈도우 옵션
export const WINDOW_OPTIONS = {
  HAS_SHADOW: true,
  FRAME: false,
  FULLSCREENABLE: false,
  RESIZABLE: false,
  DARK_THEME: true,
  TRANSPARENT: true,
  ALWAYS_ON_TOP: true,
  SANDBOX: false,
  DEV_TOOLS: true,
  NODE_INTEGRATION: true,
  BACKGROUND_THROTTLING: false,
  CONTEXT_ISOLATION: true
} as const
