import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { GroupedByName } from '../useDashboard'
import { TaskCard, TaskName, PawContainer, PawSvg } from '../styles'
import ContextMenu from '../ContextMenu'
import ConfirmModal from '@components/ConfirmModal'
import { useTaskContext } from '@renderer/context/TaskContext'

interface DashboardTaskListProps {
  tasks: GroupedByName[]
  themeColor: string
  Empty: React.ComponentType
  selectedDate: string
}

type ContextMenuState = {
  visible: boolean
  x: number
  y: number
  taskName: string
}

function DashboardTaskList({ tasks, themeColor, Empty, selectedDate }: DashboardTaskListProps) {
  const { t } = useTranslation()
  const { deleteTasksByNameAndDate } = useTaskContext()
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    taskName: ''
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleContextMenu = useCallback((e: React.MouseEvent, taskName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      taskName
    })
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [])

  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (contextMenu.taskName && selectedDate) {
      deleteTasksByNameAndDate(contextMenu.taskName, selectedDate)
    }
    setShowDeleteModal(false)
  }, [contextMenu.taskName, selectedDate, deleteTasksByNameAndDate])

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false)
  }, [])

  if (tasks.length === 0) {
    return <Empty />
  }

  return (
    <>
      {tasks.map((group, index) => (
        <TaskCard
          key={`${group.taskName}-${index}`}
          onContextMenu={(e) => handleContextMenu(e, group.taskName)}
        >
          <TaskName>{group.taskName}</TaskName>
          <PawContainer>
            {Array.from({ length: group.count }).map((_, i) => (
              <PawSvg key={i} color={themeColor} size={20} />
            ))}
          </PawContainer>
        </TaskCard>
      ))}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={handleDeleteClick}
          onClose={handleCloseContextMenu}
        />
      )}
      <ConfirmModal
        isOpen={showDeleteModal}
        message={t('dashboard.deleteConfirmModal.title')}
        cancelText={t('dashboard.deleteConfirmModal.cancelButton')}
        confirmText={t('dashboard.deleteConfirmModal.confirmButton')}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export default DashboardTaskList
