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

const PauseWrap = styled.div<{ size: number; iconSize: number }>`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background-color: ${({ theme }) => theme.color.primary[300]};
  border-radius: 50%;
  z-index: 1;
  svg {
    width: ${({ iconSize }) => iconSize}px;
    height: ${({ iconSize }) => iconSize}px;
    transform: translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
  }
`

const PlayWrap = styled.div<{ size: number; iconSize: number }>`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background-color: #e0e0e0;
  border-radius: 50%;
  z-index: 1;
  svg {
    width: ${({ iconSize }) => iconSize}px;
    height: ${({ iconSize }) => iconSize}px;
    transform: translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
  }
`

export { TimerWrapper, Svg, CircleBackground, CircleProgress, TimerText, PauseWrap, PlayWrap }
