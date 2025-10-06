import styled from 'styled-components'

type IconName = 'cat_face' | 'timer' | 'play' | 'pause' | 'close' | 'bubble' | 'icon_mini'

interface IconProps {
  name?: IconName
  src?: string
  alt?: string
  size?: number
  width?: number
  height?: number
}

const IconImage = styled.img<{ $width: number; $height: number }>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
`

const ICON_MAP: Record<IconName, string> = {
  cat_face: '/assets/icon_cat_face.svg',
  timer: '/assets/icon_timer.svg',
  play: '/assets/icon_play.svg',
  pause: '/assets/icon_pause.svg',
  close: '/assets/icon_close.svg',
  bubble: '/assets/icon_bubble_focus.svg',
  icon_mini: '/assets/icon_mini.svg'
}

const Icon = ({ name, src, alt = '', size = 16, width, height }: IconProps) => {
  const iconSrc = name ? ICON_MAP[name] : src

  if (!iconSrc) {
    console.warn('Icon: name or src prop is required')
    return null
  }

  const finalWidth = width ?? size
  const finalHeight = height ?? size

  return <IconImage src={iconSrc} alt={alt} $width={finalWidth} $height={finalHeight} />
}

export default Icon
