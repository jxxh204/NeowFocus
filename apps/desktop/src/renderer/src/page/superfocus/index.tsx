import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { AUTO_BREAK_MS } from '@neowfocus/core'
import { useTaskContext } from '@renderer/context/TaskContext'
import { IPC_CHANNELS, ROUTES } from '@renderer/constants'
import CircularTimer from '@renderer/component/CircularTimer'
import Icon from '@renderer/component/ui/Icon'
import roomMotion from './assets/workroom.webp'
import roomStill from './assets/workroom-still.png'

const SKIP_INTRO_KEY = 'neowfocus.superfocus.skipIntro.v1'

const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const readSkipIntro = () => {
  try {
    return localStorage.getItem(SKIP_INTRO_KEY) === '1'
  } catch {
    return false
  }
}

function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduce, setReduce] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const media = window.matchMedia?.(query)
    if (!media) return
    const onChange = () => setReduce(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return reduce
}

type Phase = 'focus' | 'paused' | 'done' | 'break'

export default function SuperFocusPage(): JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    currentTask,
    taskStatus,
    percentage,
    pauseTask,
    resumeTask,
    completeEarly,
    startTask,
    prepareTask,
    saveTaskToList,
    focusState,
    taskList,
    dailyTaskList,
    breakRemaining,
    breakFinished,
    finishBreak
  } = useTaskContext()
  const reduceMotion = usePrefersReducedMotion()
  const [controls, setControls] = useState(false)
  const [intro, setIntro] = useState(() => !readSkipIntro())
  const [skipNext, setSkipNext] = useState(false)

  const phase: Phase =
    taskStatus === 'end'
      ? breakRemaining > 0
        ? 'break'
        : 'done'
      : taskStatus === 'pause'
        ? 'paused'
        : 'focus'

  const backToWindow = useCallback(() => navigate(ROUTES.FOCUS), [navigate])

  // 이 화면에 있는 동안만 창을 전체화면으로 띄운다
  useEffect(() => {
    window.message?.send(IPC_CHANNELS.SUPER_FOCUS, true)
    return () => window.message?.send(IPC_CHANNELS.SUPER_FOCUS, false)
  }, [])

  // 녹색 버튼이나 ⌃⌘F로 전체화면을 빠져나오면 작은 창으로 돌아간다
  useEffect(() => {
    const electron = window.electron as {
      onSuperFocusExited?: (callback: () => void) => (() => void) | void
    }
    const cleanup = electron?.onSuperFocusExited?.(backToWindow)
    return () => {
      if (cleanup) cleanup()
    }
  }, [backToWindow])

  useEffect(() => {
    if (phase !== 'focus') setControls(false)
  }, [phase])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        backToWindow()
      } else if (e.key === ' ' && !intro) {
        if ((e.target as HTMLElement)?.closest('button,input,textarea,select,a')) return
        e.preventDefault()
        if (taskStatus === 'play') pauseTask()
        else if (taskStatus === 'pause') resumeTask()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [intro, taskStatus, pauseTask, resumeTask, backToWindow])

  const enter = () => {
    if (skipNext) {
      try {
        localStorage.setItem(SKIP_INTRO_KEY, '1')
      } catch {
        /* 다음에도 안내를 보여준다 */
      }
    }
    setIntro(false)
  }

  const repeat = () => {
    const plannedMs = focusState.current?.plannedMs
    saveTaskToList()
    startTask(currentTask.taskName, plannedMs ? plannedMs / 60_000 : undefined)
  }
  const newTask = () => {
    saveTaskToList()
    prepareTask(false)
    navigate(ROUTES.INPUT)
  }
  const doneForToday = () => {
    saveTaskToList()
    prepareTask(false)
    navigate(ROUTES.DASHBOARD)
  }

  const today = dailyTaskList.find((day) => day.date === dayjs().format('YYYY-MM-DD'))
  const savedCurrent = taskList.some((task) => task.id === currentTask.id)
  const todayCount = (today?.totalCount ?? 0) + (savedCurrent ? 0 : 1)
  const focusedMinutes = Math.max(1, Math.round(currentTask.fullDuration / 60))
  const breakTotal = AUTO_BREAK_MS / 1000
  const breakProgress = Math.min(1, Math.max(0, 1 - breakRemaining / breakTotal))

  const moving = !reduceMotion && (phase === 'focus' || phase === 'break')

  return (
    <Room>
      <Scene
        src={moving ? roomMotion : roomStill}
        alt={t('superFocus.sceneAlt')}
        $paused={phase === 'paused'}
      />
      <TopScrim aria-hidden="true" />
      <BottomScrim aria-hidden="true" />
      {phase === 'focus' && !intro && (
        <SceneButton
          type="button"
          aria-label={t('superFocus.showControls')}
          aria-expanded={controls}
          onClick={() => setControls((open) => !open)}
        />
      )}

      <Place>{t('superFocus.place')}</Place>
      {intro ? (
        <CloseButton type="button" aria-label={t('superFocus.intro.close')} onClick={backToWindow}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M4 4l10 10M14 4L4 14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </CloseButton>
      ) : (
        <Status>{t(`superFocus.status.${phase}`)}</Status>
      )}

      {intro ? (
        <Bottom>
          <Title $size={32}>{t('superFocus.intro.title')}</Title>
          <Body>{t('superFocus.intro.body')}</Body>
          <Hints>
            <li>
              <Chip>{t('superFocus.intro.click')}</Chip>
              {t('superFocus.intro.clickDesc')}
            </li>
            <li>
              <Chip as="kbd">esc</Chip>
              {t('superFocus.intro.escDesc')}
            </li>
          </Hints>
          <Primary type="button" $wide onClick={enter} autoFocus>
            {t('superFocus.intro.enter')}
          </Primary>
          <SkipLabel>
            <input
              type="checkbox"
              checked={skipNext}
              onChange={(e) => setSkipNext(e.target.checked)}
            />
            {t('superFocus.intro.skip')}
          </SkipLabel>
        </Bottom>
      ) : phase === 'focus' || phase === 'paused' ? (
        <Bottom>
          <Title>{currentTask.taskName || t('focus.defaultTaskName')}</Title>
          <Gauge
            role="img"
            aria-label={`${t('superFocus.gaugeLabel')} ${Math.round(100 - percentage)}%`}
          >
            <CircularTimer
              percentage={percentage}
              size={104}
              strokeWidth={10}
              handStrokeWidth={10}
              paused={phase === 'paused'}
            />
          </Gauge>
          {phase === 'paused' && <Caption>{t('superFocus.pausedCaption')}</Caption>}
          {phase === 'focus' && !controls && <Caption>{t('superFocus.focusHint')}</Caption>}
          {(controls || phase === 'paused') && (
            <>
              <Actions>
                {phase === 'paused' ? (
                  <Primary type="button" onClick={resumeTask} autoFocus>
                    {t('superFocus.resume')}
                  </Primary>
                ) : (
                  <Primary type="button" onClick={pauseTask} autoFocus>
                    {t('superFocus.pause')}
                  </Primary>
                )}
                <Secondary type="button" onClick={completeEarly}>
                  {t('superFocus.finish')}
                </Secondary>
              </Actions>
              {phase === 'paused' ? (
                <Hint>{t('superFocus.pausedHint')}</Hint>
              ) : (
                <TextButton type="button" onClick={backToWindow}>
                  {t('superFocus.backToWindow')}
                </TextButton>
              )}
            </>
          )}
        </Bottom>
      ) : phase === 'break' ? (
        <Bottom>
          <Title>{currentTask.taskName || t('focus.defaultTaskName')}</Title>
          <BreakTime role="timer" aria-label={t('superFocus.breakTimeLabel')}>
            {clock(breakRemaining)}
          </BreakTime>
          <Caption>{t('superFocus.breakCaption')}</Caption>
          <Progress aria-hidden="true">
            <span style={{ width: `${breakProgress * 100}%` }} />
          </Progress>
          <Actions>
            <Primary type="button" onClick={finishBreak} autoFocus>
              {t('superFocus.endBreak')}
            </Primary>
            <Secondary type="button" onClick={doneForToday}>
              {t('superFocus.today')}
            </Secondary>
          </Actions>
        </Bottom>
      ) : (
        <Bottom $gap={12}>
          <PawBadge>
            <Icon name="paw_white" alt="" size={44} />
          </PawBadge>
          <Title $size={30}>
            {breakFinished ? t('superFocus.breakOverTitle') : t('superFocus.doneTitle')}
          </Title>
          <TaskLine>{currentTask.taskName || t('focus.defaultTaskName')}</TaskLine>
          <Caption>
            {t('superFocus.doneNote', { minutes: focusedMinutes, count: todayCount })}
          </Caption>
          <Actions $top={12}>
            <Primary type="button" onClick={repeat} autoFocus>
              {t('superFocus.repeat')}
            </Primary>
            <Secondary type="button" onClick={newTask}>
              {t('superFocus.newTask')}
            </Secondary>
          </Actions>
          <TextButton type="button" onClick={doneForToday}>
            {t('superFocus.today')}
          </TextButton>
        </Bottom>
      )}
    </Room>
  )
}

const cream = '#FFF4E2'

const Room = styled.main`
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #15100b;
  color: ${cream};
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  -webkit-app-region: no-drag;
  user-select: none;

  button {
    font: inherit;
    cursor: pointer;
  }
  button:focus-visible,
  input:focus-visible {
    outline: 2px solid #e8c690;
    outline-offset: 3px;
  }
`

const Scene = styled.img<{ $paused: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: ${({ $paused }) => ($paused ? 'saturate(0.55) brightness(0.8)' : 'none')};
  transition: filter 0.4s ease;
`

const TopScrim = styled.div`
  position: absolute;
  inset: 0 0 auto 0;
  height: 160px;
  background: linear-gradient(rgba(12, 9, 6, 0.55), rgba(12, 9, 6, 0));
  pointer-events: none;
`

const BottomScrim = styled.div`
  position: absolute;
  inset: auto 0 0 0;
  height: 40%;
  background: linear-gradient(rgba(12, 9, 6, 0), rgba(12, 9, 6, 0.55));
  pointer-events: none;
`

const SceneButton = styled.button`
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  background: transparent;
  &:focus-visible {
    outline-offset: -6px;
  }
`

const Place = styled.p`
  position: absolute;
  left: 48px;
  top: 40px;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
  pointer-events: none;
`

const Status = styled.p`
  position: absolute;
  right: 40px;
  top: 30px;
  margin: 0;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(20, 16, 12, 0.5);
  border: 1px solid rgba(255, 244, 226, 0.16);
  font-size: 15px;
  font-weight: 500;
  pointer-events: none;
`

const CloseButton = styled.button`
  position: absolute;
  right: 40px;
  top: 28px;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border: 1px solid rgba(255, 244, 226, 0.16);
  background: rgba(20, 16, 12, 0.5);
  color: ${cream};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`

// 화면 가운데의 반투명 판. 뒤의 작업실과 고양이가 비쳐 보인다
const Bottom = styled.div<{ $gap?: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
  width: max-content;
  max-width: calc(100% - 96px);
  padding: 36px 48px;
  border-radius: 28px;
  background: rgba(20, 16, 12, 0.4);
  border: 1px solid rgba(255, 244, 226, 0.12);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ $gap }) => $gap ?? 18}px;
  text-align: center;
  pointer-events: none;

  button,
  label {
    pointer-events: auto;
  }
`

const Title = styled.h1<{ $size?: number }>`
  margin: 0;
  max-width: 880px;
  font-size: ${({ $size }) => $size ?? 28}px;
  line-height: 1.35;
  font-weight: ${({ $size }) => ($size ? 600 : 500)};
  letter-spacing: -0.6px;
  overflow-wrap: anywhere;
  text-shadow: 0 1px 14px rgba(0, 0, 0, 0.55);
`

const TaskLine = styled.p`
  margin: 0;
  font-size: 17px;
  line-height: 25px;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.55);
`

const Body = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 25px;
  color: rgba(255, 244, 226, 0.82);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
`

const Gauge = styled.div`
  display: flex;
`

const Caption = styled.p`
  margin: 0;
  font-size: 14px;
  letter-spacing: 2px;
  color: rgba(255, 244, 226, 0.74);
`

const Hint = styled.p`
  margin: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 244, 226, 0.66);
`

const BreakTime = styled.p`
  margin: 0;
  font-size: 112px;
  line-height: 116px;
  font-weight: 400;
  letter-spacing: -3px;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
`

const Progress = styled.div`
  width: 240px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 244, 226, 0.2);
  margin-bottom: 4px;
  span {
    display: block;
    height: 100%;
    border-radius: 2px;
    background: ${cream};
  }
`

const Actions = styled.div<{ $top?: number }>`
  margin-top: ${({ $top }) => $top ?? 4}px;
  display: flex;
  gap: 14px;
`

const Primary = styled.button<{ $wide?: boolean }>`
  width: ${({ $wide }) => ($wide ? 280 : 220)}px;
  min-height: 58px;
  border: 0;
  border-radius: 999px;
  background: #e8c690;
  color: #2b1e10;
  font-size: 18px !important;
  font-weight: 600 !important;
  margin-top: ${({ $wide }) => ($wide ? 14 : 0)}px;
  &:hover {
    background: #f0d3a3;
  }
`

const Secondary = styled.button`
  width: 220px;
  min-height: 58px;
  border-radius: 999px;
  border: 1px solid rgba(255, 244, 226, 0.24);
  background: rgba(20, 16, 12, 0.55);
  color: ${cream};
  font-size: 18px !important;
  font-weight: 500 !important;
  &:hover {
    background: rgba(40, 32, 24, 0.7);
  }
`

const TextButton = styled.button`
  min-height: 44px;
  border: 0;
  background: transparent;
  color: rgba(255, 244, 226, 0.78);
  font-size: 14px !important;
  text-decoration: underline;
  text-underline-offset: 4px;
`

const PawBadge = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 42px;
  background: rgba(20, 16, 12, 0.55);
  border: 1px solid rgba(255, 244, 226, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
`

const Hints = styled.ul`
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: rgba(255, 244, 226, 0.78);
  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

const Chip = styled.span`
  font-family: inherit;
  font-size: 12px;
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 244, 226, 0.3);
`

const SkipLabel = styled.label`
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 244, 226, 0.74);
  cursor: pointer;
  input {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: #e8c690;
  }
`
