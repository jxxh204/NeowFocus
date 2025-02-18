import Button from '@renderer/component/Button'
import Overlay from '@renderer/component/Overlay'
import styled from 'styled-components'

const AskPopup = () => {
  return (
    <Overlay>
      <Wrapper>
        <TextWrapper>
          <p>
            진행중인 태스크를 <br /> 삭제할까요?
          </p>
        </TextWrapper>
        <ButtonWrapper>
          <Button value="취소" type="outlined" color="white" />
          <Button value="삭제" type="filled" color="white" />
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
