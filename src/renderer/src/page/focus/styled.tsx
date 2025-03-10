import styled from 'styled-components'

const FocusPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  height: 132px;
`

const WindowMinimizeIcon = styled.div`
  cursor: pointer;
  margin-bottom: 6px;
  svg {
    width: 22px;
    height: 22px;
  }
`
const TrashIcon = styled.div`
  cursor: pointer;
  svg {
    width: 24px;
    height: 24px;
  }
`

const Wrapper = styled.div`
  width: 100%;
  height: 54px;
  margin-top: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`

const TimerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: end;
`

const ButtonWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

export { FocusPageWrapper, WindowMinimizeIcon, TrashIcon, Wrapper, TimerWrapper, ButtonWrapper }
