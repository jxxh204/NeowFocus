import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface ContextMenuProps {
  x: number
  y: number
  onDelete: () => void
  onClose: () => void
}

function ContextMenu({ x, y, onDelete, onClose }: ContextMenuProps) {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleScroll = () => {
      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  const handleDelete = () => {
    onDelete()
    onClose()
  }

  return (
    <MenuContainer ref={menuRef} style={{ top: y, left: x }}>
      <MenuItem onClick={handleDelete}>{t('dashboard.contextMenu.delete')}</MenuItem>
    </MenuContainer>
  )
}

const MenuContainer = styled.div`
  position: fixed;
  background: ${({ theme }) => theme.color.container.background};
  border: 1px solid ${({ theme }) => theme.color.container.border};
  border-radius: 8px;
  padding: 4px;
  min-width: 80px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`

const MenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #ff6b6b;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.color.button.hover};
  }
`

export default ContextMenu
