import styled from 'styled-components'

type OverlayProps = {
  children: React.ReactNode
}

const Overlay = ({ children }: OverlayProps) => {
  return <OverlyStyle>{children}</OverlyStyle>
}
const OverlyStyle = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
`

export default Overlay
