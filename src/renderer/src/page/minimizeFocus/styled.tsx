import styled from 'styled-components'

const Wrapper = styled.div<{ gap: number }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: ${({ gap }) => gap}px;
`
const ClickArea = styled.div<{ gap: number }>`
  display: flex;
  width: 100%;
  height: 100%;
  cursor: pointer;
  gap: ${({ gap }) => gap}px;
  z-index: 1;
`
const IconWrapper = styled.div<{ size: number; percentage: number }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: ${({ size }) => size}px;
    height: ${({ size }) => size}px;
    path {
      fill: ${({ theme }) => theme.color.primary[500]};
      fill-opacity: ${({ percentage }) => percentage / 100}; /* 0% ~ 100% 비율 적용 */
    }
  }
  z-index: 1;
`
const DragHandleWrapper = styled.div`
  cursor: pointer;
  svg {
    width: 24px;
    height: 24px;
  }
`
export { Wrapper, IconWrapper, ClickArea, DragHandleWrapper }
