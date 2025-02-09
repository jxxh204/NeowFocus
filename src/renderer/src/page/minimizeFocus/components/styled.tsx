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

export { TimerWrapper, Svg, CircleBackground, CircleProgress }
