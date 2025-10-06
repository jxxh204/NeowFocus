import styled from 'styled-components'

const StyledTopSection = styled.div<{ $height?: number }>`
  position: relative;
  height: ${({ $height }) => $height || 24}px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  -webkit-app-region: drag;
  padding: 0px 6px 0px 6px;
`

type TopSectionProps = {
  children: React.ReactNode
  height?: number
}

const TopSection = ({ children, height }: TopSectionProps) => {
  return (
    <StyledTopSection data-section="top" $height={height}>
      {children}
    </StyledTopSection>
  )
}

export default TopSection
