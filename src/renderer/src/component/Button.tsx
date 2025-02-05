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

const OutlinedButtonStyle = styled(ButtonStyle)`
  background-color: #ffffff;
  color: #000000;
`

type Props = {
  value: string
  type?: 'filled' | 'outlined'
  disabled?: boolean
  size?: string
}

function Button({ value, type = 'filled', disabled = false, size = '36px' }: Props) {
  if (type === 'filled') {
    return <FilledButtonStyle type="submit" value={value} disabled={disabled} size={size} />
  }
  return <OutlinedButtonStyle type="submit" value={value} disabled={disabled} size={size} />
}

export default Button
