import React, { Children, useEffect, useRef } from 'react'
import styled from 'styled-components'

interface CanvasCircularProps {
  size: number
  strokeWidth: number
  percentage: number
  color?: string
  text: string
}

const CanvasCircularWrap = styled.div`
  position: relative;
`
const TextStyle = styled.p`
  /* padding: 0; */
  text-align: center;
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 11px;
`

const CanvasCircular: React.FC<CanvasCircularProps> = ({
  size,
  strokeWidth,
  percentage,
  color,
  text
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (context && canvas) {
      const ratio = 2
      // window.devicePixelRatio

      canvas.width = size * ratio
      canvas.height = size * ratio
      context.scale(ratio, ratio)

      const radius = (size - strokeWidth) / 2
      const centerX = canvas.width / 4
      const centerY = canvas.height / 4
      const progress = (percentage / 100) * 2 * -Math.PI

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Draw progress arc
      context.beginPath()
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI, true)
      context.lineWidth = strokeWidth
      context.strokeStyle = '#f0f0f0'

      context.stroke()

      // Draw background circle
      context.beginPath()
      context.arc(centerX, centerY, radius, -Math.PI / 2, progress - Math.PI / 2, true)

      context.strokeStyle = color ? color : '#3498db'
      // ''

      context.lineWidth = strokeWidth
      context.stroke()

      // Draw progress arc
      context.beginPath()
      context.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI, true)
      context.lineWidth = strokeWidth
      context.strokeStyle = 'white'

      context.stroke()
      // if (text) {
      //   context.beginPath()

      //   context.font = '12px'
      //   context.font = context.fillText(text, 0, centerY)
      //   // context.textAlign = 'center'
      // }
    }
  }, [percentage])

  return (
    <CanvasCircularWrap>
      <canvas ref={canvasRef} style={{ width: size, height: size }}></canvas>
      <TextStyle>{text}</TextStyle>
    </CanvasCircularWrap>
  )
}

export default CanvasCircular
