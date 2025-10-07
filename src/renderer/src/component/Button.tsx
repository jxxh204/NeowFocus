import styled from 'styled-components'
import theme from '../styles/theme'

const ButtonStyle = styled.input<{ width?: string; size?: string }>`
  border: 1px solid ${theme.color.black};
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
  background-color: ${theme.color.black};
  color: ${theme.color.white};
  border: none;

  &:hover {
    background-color: ${theme.color.black};
    color: ${theme.color.primary[500]};
  }
  &:active {
    background-color: ${theme.color.primary[500]};
    color: ${theme.color.black};
  }
  &:disabled {
    background-color: ${theme.color.button.disabled.background};
    color: ${theme.color.button.disabled.text};
    border: 1px solid ${theme.color.button.disabled.border};
    cursor: not-allowed;
  }
`
const WhiteFilledButtonStyle = styled(ButtonStyle)`
  background-color: ${theme.color.white};
  color: ${theme.color.black};

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.5);
  }
  &:disabled {
    background-color: ${theme.color.button.disabled.background};
    color: ${theme.color.button.disabled.text};
    border: 1px solid ${theme.color.button.disabled.border};
    cursor: not-allowed;
  }
`

const OutlinedButtonStyle = styled(ButtonStyle)`
  background-color: ${theme.color.white};
  color: ${theme.color.black};
`
const WhiteOutlinedButtonStyle = styled(ButtonStyle)`
  background-color: transparent;
  color: ${theme.color.white};
  border: 1px solid ${theme.color.white};

  &:hover {
    background-color: ${theme.color.button.hover};
  }
  &:active {
    background-color: ${theme.color.button.ghost.hover};
    border: 1px solid ${theme.color.button.ghost.hoverBorder};
  }
  &:disabled {
    background-color: ${theme.color.button.disabled.background};
    color: ${theme.color.button.disabled.text};
    border: 1px solid ${theme.color.button.disabled.border};
    cursor: not-allowed;
  }
`

type Props = {
  value: string
  type?: 'filled' | 'outlined'
  disabled?: boolean
  size?: string
  color?: 'primary' | 'white'
  onClick?: () => void
}

function Button({
  value,
  type = 'filled',
  disabled = false,
  size = '36px',
  color = 'primary',
  ...rest
}: Props) {
  if (type === 'filled') {
    if (color === 'primary') {
      return (
        <FilledButtonStyle type="submit" value={value} disabled={disabled} size={size} {...rest} />
      )
    } else if (color === 'white') {
      return (
        <WhiteFilledButtonStyle
          type="submit"
          value={value}
          disabled={disabled}
          size={size}
          {...rest}
        />
      )
    }
  } else if (type === 'outlined') {
    if (color === 'primary') {
      return (
        <OutlinedButtonStyle
          type="submit"
          value={value}
          disabled={disabled}
          size={size}
          {...rest}
        />
      )
    } else if (color === 'white') {
      return (
        <WhiteOutlinedButtonStyle
          type="submit"
          value={value}
          disabled={disabled}
          size={size}
          {...rest}
        />
      )
    }
  }
  return null
}

export default Button
