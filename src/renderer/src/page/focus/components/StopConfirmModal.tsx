import styled from 'styled-components'

interface StopConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function StopConfirmModal({ isOpen, onClose, onConfirm }: StopConfirmModalProps) {
  if (!isOpen) return null

  return (
    <Overlay>
      <ModalContainer>
        <ModalText>진행중인 작업을 중단하실 건가요?</ModalText>
        <ButtonContainer>
          <ModalButton onClick={onClose}>닫기</ModalButton>
          <ModalButton $primary onClick={onConfirm}>
            중단하기
          </ModalButton>
        </ButtonContainer>
      </ModalContainer>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`

const ModalContainer = styled.div`
  width: 240px;
  height: 108px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
`

const ModalText = styled.div`
  font-size: 14px;
  color: #ffffff;
  text-align: center;
  line-height: 1.4;
`

const ButtonContainer = styled.div`
  display: flex;
  width: 100%;
  height: 48px;
  gap: 0;
`

const ModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  border-right: ${({ $primary }) => ($primary ? 'none' : '1px solid rgba(255, 255, 255, 0.1)')};
  color: #ffffff;
  font-size: 14px;
  font-weight: ${({ $primary }) => ($primary ? '600' : '400')};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:first-child {
    border-radius: 0 0 0 8px;
  }

  &:last-child {
    border-radius: 0 0 8px 0;
  }
`
