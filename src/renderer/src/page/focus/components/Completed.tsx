import Button from '@renderer/component/Button'
import { ButtonWrapper } from '../styled'
import { EndWrap } from './styled'
import PawCircleWhiteSvg from '@assets/paw_circle_white.svg'
import { usePopup } from '@renderer/context/PopupContext'
import { useTaskContext } from '@renderer/context/TaskContext'

const Completed = () => {
  const { openPopup } = usePopup()
  const { reStartTask } = useTaskContext()
  const handleClickEnd = () => {
    openPopup('completed')
  }
  const handleClickMore = () => {
    reStartTask()
  }
  return (
    <>
      <ButtonWrapper>
        <Button value="이 작업 끝!" type="outlined" onClick={handleClickEnd} />
        <Button value="한번 더" type="filled" onClick={handleClickMore} />
      </ButtonWrapper>

      <EndWrap $size={54} $iconSize={54}>
        <PawCircleWhiteSvg />
      </EndWrap>
    </>
  )
}

export default Completed
