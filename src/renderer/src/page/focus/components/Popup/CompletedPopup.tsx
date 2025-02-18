import Overlay from '@renderer/component/Overlay'
import PawCircleGreenSvg from '@assets/paw_circle_green.svg'
import styled from 'styled-components'

const CompletedPopup = () => {
  const paw = 6
  return (
    <Overlay>
      <Wrapper>
        <PawCircleGreenSvg />
        <TextWrapper>
          <h2>집중해서 끝내셨군요. 대단해요!</h2>
          <span>획득한 발자국 +{paw}개</span>
        </TextWrapper>
      </Wrapper>
    </Overlay>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
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

  h2 {
    font-size: 16px;
    font-weight: 700;
    color: white;
  }
  span {
    font-size: 14px;
    font-weight: 400;
    color: #d3d3d3;
  }
`

export default CompletedPopup
