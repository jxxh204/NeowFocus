import { useState } from 'react'
import styled from 'styled-components'
import Icon from '@renderer/component/ui/Icon'
import { SubButton } from '@renderer/component/ui/SubButton'

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
      <TaskNameText>{taskName}</TaskNameText>
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
    background: rgba(187, 187, 187, 0.08);
  `}
`

const TaskNameText = styled.div`
  color: ${({ theme }) => theme.color.text.primary};
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  word-break: break-word;
  line-height: 20px;
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
