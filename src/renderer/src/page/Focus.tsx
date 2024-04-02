import CountDown from '@renderer/component/CountDown/CountDown'
import ScreenDrag from '@renderer/component/ScreenDrag/ScreenDrag'
import useScreenDrag from '@renderer/component/ScreenDrag/useScreenDrag'
import SkipButton from '@renderer/component/SkipButton'
import { useStorage } from '@renderer/context/TaskContext'
import styled from 'styled-components'
const DefaultTaskWrap = styled.section`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.size.gap};
`

const DefaultTaskStyle = styled.div`
  border-radius: ${({ theme }) => theme.border.radius};
  border: 1px solid ${({ theme }) => theme.border.color};
  background: #272727;
  color: white;
  padding: 12px 8px;
  width: 100%;
`

export function FocusDefault(): JSX.Element {
  const { storage } = useStorage()
  const { mouseMoveHandler, mouseUpHandler, mouseDownHandler } = useScreenDrag()
  return (
    <DefaultTaskWrap>
      <DefaultTaskStyle>{storage.taskName}</DefaultTaskStyle>
      <CountDown countMinutes={storage.timer} color={'black'} isMinutesTimer={true} />
      <ScreenDrag
        width={34}
        height={30}
        mouseMoveHandler={mouseMoveHandler}
        mouseUpHandler={mouseUpHandler}
        mouseDownHandler={mouseDownHandler}
      />
      <SkipButton navi={'complete'} />
    </DefaultTaskWrap>
  )
}
export function FocusControl() {
  return <>focus control</>
}
