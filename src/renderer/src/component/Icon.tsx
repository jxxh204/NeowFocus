import styled from 'styled-components'

interface IconProps {
  src: string
  alt?: string
  size?: number
}

const StyledIcon = styled.img<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: block;
`

const Icon = ({ src, alt = '', size = 16 }: IconProps) => {
  return <StyledIcon src={src} alt={alt} size={size} />
}

export default Icon
