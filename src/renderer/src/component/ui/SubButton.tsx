import styled from 'styled-components'

type SubButtonSize = 'S' | 'M'

interface SubButtonProps {
  size?: SubButtonSize
}

export const SubButton = styled.button<SubButtonProps>`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  ${({ size = 'S' }) =>
    size === 'S'
      ? `
    width: 68px;
    height: 26px;
    padding: 6px 7.5px;
    gap: 2px;
  `
      : `
    padding: 12px;
    gap: 4px;
  `}

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`
