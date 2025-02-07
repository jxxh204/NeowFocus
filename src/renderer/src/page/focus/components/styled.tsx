import styled from 'styled-components'

const TimerWrapper = styled.div<{ size: number }>`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const Svg = styled.svg`
  transform: rotate(-90deg);
  z-index: 2;
`

const CircleBackground = styled.circle<{ strokeWidth: number; color: string }>`
  fill: none;
  stroke: ${({ color }) => color};
  stroke-width: ${({ strokeWidth }) => strokeWidth}px;
`

const CircleProgress = styled.circle<{ strokeWidth: number; color: string }>`
  fill: none;
  stroke: ${({ color }) => color};
  stroke-width: ${({ strokeWidth }) => strokeWidth}px;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
`

const TimerText = styled.div<{ size: number; color: string }>`
  position: absolute;
  font-size: ${({ size }) => size / 4}px;
  font-weight: bold;
  color: ${({ color }) => color};
`

const PauseWrap = styled.div<{ size: number }>`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background-color: ${({ theme }) => theme.color.primery[300]};
  border-radius: 50%;
  z-index: 1;
`

const PauseIcon = styled.img<{ size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`

const PlayWrap = styled.div<{ size: number }>`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background-color: #e0e0e0;
  border-radius: 50%;
  z-index: 1;
`

const PlayIcon = styled.img<{ size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`

export {
  TimerWrapper,
  Svg,
  CircleBackground,
  CircleProgress,
  TimerText,
  PauseWrap,
  PauseIcon,
  PlayWrap,
  PlayIcon
}
