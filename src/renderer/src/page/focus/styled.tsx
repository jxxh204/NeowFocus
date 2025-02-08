import styled from 'styled-components'

const FocusPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  height: 132px;
`

const WindowMinimizeIcon = styled.img`
  width: 22px;
  height: 22px;
  cursor: pointer;
  margin-bottom: 6px;
`
const TrashIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
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

export { FocusPageWrapper, WindowMinimizeIcon, TrashIcon, Wrapper, TimerWrapper }
