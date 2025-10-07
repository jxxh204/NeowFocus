import styled from 'styled-components'

const StyledBodySection = styled.div<{ $height?: number; $padding?: string }>`
  position: relative;
  height: ${({ $height }) => $height || 64}px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${({ $padding }) => $padding || '10px'};
  box-shadow: inset 0 -1px 0 0 ${({ theme }) => theme.color.container.border};
  background: transparent;
  box-sizing: border-box;
`

type BodySectionProps = {
  children: React.ReactNode
  height?: number
  padding?: string
}

const BodySection = ({ children, height, padding }: BodySectionProps) => {
  return (
    <StyledBodySection data-section="body" $height={height} $padding={padding}>
      {children}
    </StyledBodySection>
  )
}

export default BodySection
