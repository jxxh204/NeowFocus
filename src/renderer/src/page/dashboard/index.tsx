import Container from '@components/Container'
import { useDashboard } from './useDashboard'
import Dashboard from './Dashboard'

function DashboardPage() {
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
    <Container width={400}>
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
          />
        </Dashboard>
      </Container.Body>
    </Container>
  )
}

export default DashboardPage
