import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const ButtonStyle = styled.input`
  border-radius: ${({ theme }) => theme.border.radius};
  padding: 12px;
  background-color: white;
  border: 1px solid;
  font-size: 16px;
  cursor: pointer;

  transition: background-color 0.2s;
  background: #f0f0f0;

  &:hover {
    background: ${({ theme }) => theme.color.green[300]};
  }
`

function SkipButton({ navi }: { navi: string }): JSX.Element {
  const navigate = useNavigate()

  const onClickHandler = () => {
    navigate(`/${navi}`)
  }

  return <ButtonStyle type="button" onClick={onClickHandler} value="skip"></ButtonStyle>
}

export default SkipButton
