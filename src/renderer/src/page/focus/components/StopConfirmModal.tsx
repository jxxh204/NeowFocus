import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import theme from '@renderer/styles/theme'

interface StopConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function StopConfirmModal({ isOpen, onClose, onConfirm }: StopConfirmModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <Overlay>
      <ModalContainer>
        <ModalText>{t('focus.stopConfirmModal.title')}</ModalText>
        <ButtonContainer>
          <ModalButton onClick={onClose}>{t('focus.stopConfirmModal.cancelButton')}</ModalButton>
          <ModalButton $primary onClick={onConfirm}>
            {t('focus.stopConfirmModal.confirmButton')}
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
  z-index: 1000;
`

const ModalContainer = styled.div`
  width: 240px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding-top: 20px;
  padding-bottom: 0;
`

const ModalText = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  color: ${theme.color.white};
  text-align: center;
  line-height: 22px;
  white-space: pre;
`

const ButtonContainer = styled.div`
  display: flex;
  width: 100%;
  height: 48px;
`

const ModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-right: ${({ $primary }) => ($primary ? '1px' : '1px')} solid rgba(255, 255, 255, 0.1);
  color: ${theme.color.text.light};
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: ${({ $primary }) => ($primary ? '700' : '500')};
  cursor: pointer;
  opacity: 0.8;
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
