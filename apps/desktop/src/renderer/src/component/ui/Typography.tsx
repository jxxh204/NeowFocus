import styled from 'styled-components'

type TypographyVariant = 'caption' | 'body2' | 'body1' | 'subtitle'

interface TypographyProps {
  variant?: TypographyVariant
  weight?: 400 | 500 | 700
  color?: string
  align?: 'left' | 'center' | 'right'
}

/**
 * Typography 컴포넌트
 *
 * Variants:
 * - caption: 10px (SubButton 레이블)
 * - body2: 12px (일반 텍스트, 버튼)
 * - body1: 14px (모달 텍스트, Input)
 * - subtitle: 15px (제목, TaskName)
 */
export const Typography = styled.span<TypographyProps>`
  font-family: 'Pretendard', sans-serif;
  color: ${({ color }) => color || 'inherit'};
  text-align: ${({ align }) => align || 'left'};
  word-break: break-word;

  ${({ variant = 'body2', weight }) => {
    switch (variant) {
      case 'caption':
        return `
          font-size: 10px;
          font-weight: ${weight || 400};
          line-height: 14px;
        `
      case 'body2':
        return `
          font-size: 12px;
          font-weight: ${weight || 500};
          line-height: 20px;
        `
      case 'body1':
        return `
          font-size: 14px;
          font-weight: ${weight || 400};
          line-height: 22px;
        `
      case 'subtitle':
        return `
          font-size: 15px;
          font-weight: ${weight || 500};
          line-height: 20px;
        `
    }
  }}
`
