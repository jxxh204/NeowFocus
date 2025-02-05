import styled from 'styled-components'
import pawGray from '@assets/paw_gray.svg'

const TextFieldContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`

const TextFieldStyle = styled.input<{ hovered: boolean }>`
  width: 260px;
  padding: 8px 0px 8px 30px;
  border-radius: 6px;
  outline: none;
  border: 1px solid #e8e8e8;

  ${({ hovered }) =>
    !hovered &&
    `
      color: ${({ theme }) => theme.color.gray[500]};`}

  &:focus + div span,
  &:not(:placeholder-shown) + div span {
    display: none;
  }
  &:focus {
    border: 1px solid black;
    color: black;
  }
`

const Placeholder = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.color.gray[500]};
  font-size: 14px;
  pointer-events: none;

  img {
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }
`

type Props = {
  placeholder: string
  hovered: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  maxLength?: number
}

function TextField({ placeholder, onChange, maxLength, hovered }: Props) {
  // TODO : TextField에 도메인 정보가 많으므로 분리 필요.
  return (
    <TextFieldContainer>
      <TextFieldStyle
        type="text"
        placeholder=" "
        onChange={onChange}
        maxLength={maxLength}
        hovered={hovered}
      />
      <Placeholder>
        <img src={pawGray} alt="placeholder image" />
        <span>{placeholder}</span>
      </Placeholder>
    </TextFieldContainer>
  )
}

export default TextField
