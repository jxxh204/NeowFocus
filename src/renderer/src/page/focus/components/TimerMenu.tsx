import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Icon from '@renderer/component/Icon'
import theme from '@renderer/styles/theme'

interface TimerMenuProps {
  onPause: () => void
  onStop: () => void
}

export default function TimerMenu({ onPause, onStop }: TimerMenuProps) {
  const { t } = useTranslation()

  return (
    <MenuContainer>
      <MenuItem onClick={onPause}>
        <Icon name="pause" alt="pause" size={14} />
        <MenuLabel>{t('focus.timerMenu.pause')}</MenuLabel>
      </MenuItem>
      <MenuDivider />
      <MenuItem onClick={onStop}>
        <Icon name="close" alt="stop" size={14} />
        <MenuLabel>{t('focus.timerMenu.stop')}</MenuLabel>
      </MenuItem>
    </MenuContainer>
  )
}

const MenuContainer = styled.div`
  width: 68px;
  height: 52px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 0;
`

const MenuItem = styled.button`
  width: 100%;
  height: 26px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 7.5px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`

const MenuDivider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
`

const MenuLabel = styled.span`
  font-size: 10px;
  color: ${theme.color.white};
  white-space: nowrap;
`
