import Icon from '@renderer/component/Icon'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ANIMATION } from '@renderer/constants'

interface TimerCompletionProps {
  sessionCount: number
  onNewTask: () => void
  onRepeat: () => void
}

export default function TimerCompletion({ sessionCount }: TimerCompletionProps) {
  const [pawColor, setPawColor] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPawColor((prev) => (prev + 1) % 2)
    }, ANIMATION.PAW_COLOR_CHANGE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const displayCount = sessionCount > 999 ? '999+' : sessionCount

  return (
    <Container>
      <TimerCircle $color={pawColor}>
        <Icon name="paw_white" size={28} />
      </TimerCircle>
      <SessionCount>{displayCount}회차</SessionCount>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const colors = ['#00FF85', '#1FAA67']

const TimerCircle = styled.div<{ $color: number }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ $color }) => colors[$color]};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${ANIMATION.PAW_TRANSITION_DURATION}ms linear;
`

const SessionCount = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #858585;
  text-align: center;
`
