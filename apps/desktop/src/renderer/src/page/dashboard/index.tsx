import styled from 'styled-components'
import { useTaskContext } from '@renderer/context/TaskContext'
import Container from '@components/Container'
import { WINDOW_SIZE } from '@renderer/constants'
import { useDashboard } from './useDashboard'
import Dashboard from './Dashboard'

const Undo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 22px;
  font-size: 12px;
  color: #b5b8b5;
  button {
    border: 0;
    background: none;
    color: #eee;
    text-decoration: underline;
    text-underline-offset: 4px;
    cursor: pointer;
  }
`

function DashboardPage() {
  const { deletedTaskCount, undoDeletedTasks } = useTaskContext()
  const {
    selectedDate,
    availableDates,
    groupedTasks,
    themeColorValue,
    DASHBOARD_TOP_SECTION_HEIGHT,
    DASHBOARD_BODY_HEIGHT,
    handleBack,
    handleDateSelect
  } = useDashboard()

  return (
    <Container width={WINDOW_SIZE.DEFAULT_WIDTH}>
      <Container.Top height={DASHBOARD_TOP_SECTION_HEIGHT}>
        <div />
      </Container.Top>
      <Container.Body height={DASHBOARD_BODY_HEIGHT} padding="0">
        <Dashboard>
          <Dashboard.Header onBack={handleBack}>
            <Dashboard.DatePicker
              selectedDate={selectedDate}
              availableDates={availableDates}
              onSelect={handleDateSelect}
            />
          </Dashboard.Header>
          <Dashboard.TaskList
            tasks={groupedTasks}
            themeColor={themeColorValue}
            Empty={Dashboard.Empty}
            selectedDate={selectedDate}
          />
        </Dashboard>
      </Container.Body>
      {deletedTaskCount > 0 && (
        <Container.Bottom height={40}>
          <Undo role="status">
            <span>기록 {deletedTaskCount}개 삭제됨</span>
            <button type="button" onClick={undoDeletedTasks}>
              실행 취소
            </button>
          </Undo>
        </Container.Bottom>
      )}
    </Container>
  )
}

export default DashboardPage
