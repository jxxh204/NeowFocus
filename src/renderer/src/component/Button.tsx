import styled from 'styled-components'

const ButtonStyle = styled.input<{ width?: string; size?: string }>`
  border: 1px solid #000000;
  height: ${({ size }) => size};
  padding: 0 16px;
  box-shadow: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`

const FilledButtonStyle = styled(ButtonStyle)`
  background-color: #000000;
  color: #ffffff;
  border: none;

  &:hover {
    background-color: #000000;
    color: #00ff85;
  }
  &:active {
    background-color: #00ff85;
    color: #000000;
  }
  &:disabled {
    background-color: #e8e8e8;
    color: #8d8d8d;
    border: 1px solid #8d8d8d;
    cursor: not-allowed;
  }
`
const WhiteFilledButtonStyle = styled(ButtonStyle)`
  background-color: #ffffff;
  color: #000000;

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.5);
  }
  &:disabled {
    background-color: #e8e8e8;
    color: #8d8d8d;
    border: 1px solid #8d8d8d;
    cursor: not-allowed;
  }
`

const OutlinedButtonStyle = styled(ButtonStyle)`
  background-color: #ffffff;
  color: #000000;
`
const WhiteOutlinedButtonStyle = styled(ButtonStyle)`
  background-color: transparent;
  color: #ffffff;
  border: 1px solid #ffffff;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &:active {
    background-color: #838383;
    border: 1px solid #969696;
  }
  &:disabled {
    background-color: #e8e8e8;
    color: #8d8d8d;
    border: 1px solid #8d8d8d;
    cursor: not-allowed;
  }
`

type Props = {
  value: string
  type?: 'filled' | 'outlined'
  disabled?: boolean
  size?: string
  color?: 'primary' | 'white'
}

function Button({
  value,
  type = 'filled',
  disabled = false,
  size = '36px',
  color = 'primary'
}: Props) {
  if (type === 'filled') {
    if (color === 'primary') {
      return <FilledButtonStyle type="submit" value={value} disabled={disabled} size={size} />
    } else if (color === 'white') {
      return <WhiteFilledButtonStyle type="submit" value={value} disabled={disabled} size={size} />
    }
  } else if (type === 'outlined') {
    if (color === 'primary') {
      return <OutlinedButtonStyle type="submit" value={value} disabled={disabled} size={size} />
    } else if (color === 'white') {
      return (
        <WhiteOutlinedButtonStyle type="submit" value={value} disabled={disabled} size={size} />
      )
    }
  }
}

export default Button
