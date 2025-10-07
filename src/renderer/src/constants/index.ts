// 시간 관련 상수
export const TIME = {
  DEFAULT_POMODORO_DURATION: 10, // 10초 (테스트용)
  TIMER_INTERVAL: 1000,
  SECONDS_PER_MINUTE: 60,
  TIME_DISPLAY_PADDING: 2
} as const

// 애니메이션 상수
export const ANIMATION = {
  PAW_COLOR_CHANGE_INTERVAL: 600, // 발바닥 색상 변경 인터벌 (ms)
  PAW_TRANSITION_DURATION: 300 // 발바닥 색상 전환 애니메이션 시간 (ms)
} as const

// 윈도우 크기 상수
export const WINDOW_SIZE = {
  DEFAULT_WIDTH: 402,
  MIN_HEIGHT: 158,
  MAX_HEIGHT: 900,
  TOP_SECTION_HEIGHT: 30,
  BODY_SECTION_HEIGHT: 84,
  BODY_SECTION_FOCUS_HEIGHT: 108,
  BOTTOM_SECTION_HEIGHT: 48,
  TINY_WINDOW_WIDTH: 322,
  TINY_WINDOW_HEIGHT: 35,
  TINY_TASK_NAME_WIDTH: 260,
  TINY_TASK_NAME_TEXT_WIDTH: 236,
  TINY_TIMER_CONTAINER_SIZE: 36,
  TINY_TIMER_SIZE: 24,
  TINY_DRAG_HANDLE_WIDTH: 24
} as const

// 라우트 경로
export const ROUTES = {
  INPUT: '/',
  FOCUS: '/focus',
  TINY_WINDOW: '/tiny_window'
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

// 입력 제한
export const INPUT_LIMITS = {
  TASK_NAME_MAX_LENGTH: 54,
  TINY_WINDOW_TEXT_ELLIPSIS_THRESHOLD: 18
} as const
