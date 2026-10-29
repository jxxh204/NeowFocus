import styled from 'styled-components'

const StyledButton = styled.button<{ $disabled?: boolean }>`
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.color.text.disabled : theme.color.text.primary};
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 14px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${({ theme, $disabled }) =>
      !$disabled ? theme.color.button.hover : 'transparent'};
  }

  &:hover span {
    text-decoration: ${({ $disabled }) => (!$disabled ? 'underline' : 'none')};
    text-decoration-skip-ink: none;
    text-underline-position: from-font;
  }

  &:active {
    background: ${({ theme, $disabled }) =>
      !$disabled ? theme.color.button.active : 'transparent'};
  }

  &:active span {
    text-decoration: none;
  }

  /* 버튼 사이 구분선 */
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 24px;
    width: 1px;
    background: ${({ theme }) => theme.color.container.border};
  }
`

const ButtonLabel = styled.span`
  white-space: pre;
`

type BottomButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

const BottomButton = ({ children, onClick, disabled = false, type = 'button' }: BottomButtonProps) => {
  // children을 순회하며 텍스트와 아이콘 분리
  const childArray = Array.isArray(children) ? children : [children]
  const textNode = childArray.find((child) => typeof child === 'string')
  const iconNode = childArray.find((child) => typeof child !== 'string')

  return (
    <StyledButton type={type} onClick={onClick} disabled={disabled} $disabled={disabled}>
      {textNode && <ButtonLabel>{textNode}</ButtonLabel>}
      {iconNode}
    </StyledButton>
  )
}

export default BottomButton
