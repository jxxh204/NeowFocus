import styled from 'styled-components'

const TimerWrapper = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const Svg = styled.svg`
  transform: rotate(-90deg);
  z-index: 2;
`

const CircleBackground = styled.circle<{ $strokeWidth: number; $color: string }>`
  fill: none;
  stroke: ${({ $color }) => $color};
  stroke-width: ${({ $strokeWidth }) => $strokeWidth}px;
`

const CircleProgress = styled.circle<{ $strokeWidth: number; $color: string }>`
  fill: none;
  stroke: ${({ $color }) => $color};
  stroke-width: ${({ $strokeWidth }) => $strokeWidth}px;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
`

const TimerText = styled.div<{ $size: number; $color: string }>`
  position: absolute;
  font-size: ${({ $size }) => $size / 4}px;
  font-weight: bold;
  color: ${({ $color }) => $color};
`
export const SvgWrap = styled.div<{ $size: number; $iconSize: number }>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background-color: ${({ theme }) => theme.color.primary[300]};
  border-radius: 50%;
  z-index: 1;
  svg {
    width: ${({ $iconSize }) => $iconSize}px;
    height: ${({ $iconSize }) => $iconSize}px;
    transform: translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
  }
`

const EndWrap = styled(TimerWrapper)<{ $size: number; $iconSize: number }>`
  @keyframes fadeCycleBackground {
    0% {
    }
    50% {
      color: ${({ theme }) => theme.color.primary[500]};
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes fadePath {
    0% {
    }
    50% {
      fill: ${({ theme }) => theme.color.primary[500]};
    }
    100% {
    }
  }
  @keyframes fadeCycle {
    0% {
    }
    50% {
      stroke: ${({ theme }) => theme.color.primary[500]};
    }
    100% {
    }
  }
  svg {
    color: white;
    background-color: white;
    path {
      animation: fadePath 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    circle {
      animation: fadeCycle 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
`

export { TimerWrapper, Svg, CircleBackground, CircleProgress, TimerText, EndWrap }
