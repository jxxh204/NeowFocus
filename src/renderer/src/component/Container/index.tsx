import styled from 'styled-components'
import { useEffect, useRef } from 'react'
import useWindowSize from '@renderer/hooks/useWindowSize'
import TopSection from './TopSection'
import BodySection from './BodySection'
import BottomSection from './BottomSection'
import BottomButton from './BottomButton'

const ContainerForm = styled.form`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  -webkit-app-region: no-drag;

  /* macOS 네이티브 vibrancy 활용 - 반투명 배경만 추가 */
  background: ${({ theme }) => theme.color.container.background};

  /* 내부 테두리선 (inset border) */
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.container.border};
`

type ContainerProps = {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}

const Container = ({ children, onSubmit }: ContainerProps) => {
  const containerRef = useRef<HTMLFormElement>(null)
  const { setWindowSize } = useWindowSize()

  useEffect(() => {
    if (containerRef.current) {
      const topHeight =
        containerRef.current.querySelector('[data-section="top"]')?.clientHeight || 0
      const bodyHeight =
        containerRef.current.querySelector('[data-section="body"]')?.clientHeight || 0
      const bottomHeight =
        containerRef.current.querySelector('[data-section="bottom"]')?.clientHeight || 0

      const totalHeight = topHeight + bodyHeight + bottomHeight

      if (totalHeight > 0) {
        setWindowSize(totalHeight)
      }
    }
  }, [children, setWindowSize])

  return (
    <ContainerForm ref={containerRef} onSubmit={onSubmit}>
      {children}
    </ContainerForm>
  )
}

Container.Top = TopSection
Container.Body = BodySection
Container.Bottom = BottomSection
Container.Button = BottomButton

export default Container
