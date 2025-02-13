import Button from '@renderer/component/Button'
import { ButtonWrapper } from '../styled'
import { EndWrap } from './styled'
import PawCircleWhiteSvg from '@assets/paw_circle_white.svg'

const Completed = () => {
  return (
    <>
      <ButtonWrapper>
        <Button value="이 작업 끝!" type="outlined" />
        <Button value="한번 더" type="filled" />
      </ButtonWrapper>

      <EndWrap $size={54} $iconSize={54}>
        <PawCircleWhiteSvg />
      </EndWrap>
    </>
  )
}

export default Completed
