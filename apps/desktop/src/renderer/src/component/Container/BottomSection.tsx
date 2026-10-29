import styled from 'styled-components'

const StyledBottomSection = styled.div<{ $height?: number; $padding?: string }>`
  position: relative;
  height: ${({ $height }) => $height || 48}px;
  display: flex;
  align-items: center;
  padding: ${({ $padding }) => $padding || '0'};
  -webkit-app-region: no-drag;
`

type BottomSectionProps = {
  children: React.ReactNode
  height?: number
  padding?: string
}

const BottomSection = ({ children, height, padding }: BottomSectionProps) => {
  return (
    <StyledBottomSection data-section="bottom" $height={height} $padding={padding}>
      {children}
    </StyledBottomSection>
  )
}

export default BottomSection
