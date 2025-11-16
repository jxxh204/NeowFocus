import { useState } from 'react'
import styled from 'styled-components'
import Icon from '@renderer/component/ui/Icon'
import { SubButton } from '@renderer/component/ui/SubButton'
import { Typography } from '@renderer/component/ui/Typography'

interface TaskNameDisplayProps {
  taskName: string
  onComplete?: () => void
  onDelete?: () => void
}

export default function TaskNameDisplay({ taskName, onComplete, onDelete }: TaskNameDisplayProps) {
  const [isHovering, setIsHovering] = useState(false)

  const shouldShowOverlay = isHovering && (onComplete || onDelete)

  return (
    <TaskNameBox
      $isHovering={isHovering}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Typography variant="subtitle" color="#FFFFFF" align="center">
        {taskName}
      </Typography>
      {shouldShowOverlay && (
        <Overlay>
          <ButtonGroup>
            {onDelete && (
              <SubButton size="M" onClick={onDelete}>
                <Icon name="trash" size={16} />
              </SubButton>
            )}
            {onComplete && (
              <SubButton size="M" onClick={onComplete}>
                <Icon name="check" size={16} />
                <Typography variant="body2" color="#FFFFFF">
                  빠른 완료
                </Typography>
              </SubButton>
            )}
          </ButtonGroup>
        </Overlay>
      )}
    </TaskNameBox>
  )
}

const TaskNameBox = styled.div<{ $isHovering: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 292px;
  height: 88px;
  padding: 10px;
  box-sizing: border-box;
  background: rgba(187, 187, 187, 0.04);
  border-radius: 8px;
  transition: background 0.2s;

  ${({ $isHovering }) =>
    $isHovering &&
    `
    background: rgba(0,0,0, 0.5);
  `}
`

const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`
