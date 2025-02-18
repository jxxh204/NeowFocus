import Button from '@renderer/component/Button'
import { ButtonWrapper } from '../styled'
import { EndWrap } from './styled'
import PawCircleWhiteSvg from '@assets/paw_circle_white.svg'
import { usePopup } from '@renderer/context/PopupContext'
const Completed = () => {
  const { openPopup } = usePopup()
  const handleClickEnd = () => {
    openPopup('completed')
  }
  return (
    <>
      <ButtonWrapper>
        <Button value="이 작업 끝!" type="outlined" onClick={handleClickEnd} />
        <Button value="한번 더" type="filled" />
      </ButtonWrapper>

      <EndWrap $size={54} $iconSize={54}>
        <PawCircleWhiteSvg />
      </EndWrap>
    </>
  )
}

export default Completed
