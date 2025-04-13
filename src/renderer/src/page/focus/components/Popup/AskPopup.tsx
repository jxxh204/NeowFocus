import Button from '@renderer/component/Button'
import Overlay from '@renderer/component/Overlay'
import { usePopup } from '@renderer/context/PopupContext'
import { useTaskContext } from '@renderer/context/TaskContext'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const AskPopup = () => {
  const { resetCurrentTask } = useTaskContext()
  const { closePopup } = usePopup()
  const navigate = useNavigate()
  const handleClickCancel = () => {
    closePopup()
  }
  const handleClickDelete = () => {
    closePopup()
    resetCurrentTask()
    navigate('/')
  }
  return (
    <Overlay>
      <Wrapper>
        <TextWrapper>
          <p>
            진행중인 태스크를 <br /> 삭제할까요?
          </p>
        </TextWrapper>
        <ButtonWrapper>
          <Button value="취소" type="outlined" color="white" onClick={handleClickCancel} />
          <Button value="삭제" type="filled" color="white" onClick={handleClickDelete} />
        </ButtonWrapper>
      </Wrapper>
    </Overlay>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 12px;
  svg {
    width: 64px;
    height: 64px;
  }
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;

  p {
    font-size: 18px;
    font-weight: 400;
    color: white;
    line-height: 28px;
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`
export default AskPopup
