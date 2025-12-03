import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import { useDashboard } from './useDashboard'
import Dashboard from './Dashboard'
import DatePicker from './DatePicker'
import { BackButton } from './styles'

function DashboardPage() {
  const {
    selectedDate,
    availableDates,
    groupedTasks,
    themeColorValue,
    showDatePicker,
    DASHBOARD_TOP_SECTION_HEIGHT,
    DASHBOARD_BODY_HEIGHT,
    handleBack,
    handleDateSelect,
    handleToggleDatePicker,
    handleCloseDatePicker
  } = useDashboard()

  return (
    <Container width={400}>
      <Container.Top height={DASHBOARD_TOP_SECTION_HEIGHT}>
        <div />
      </Container.Top>
      <Container.Body height={DASHBOARD_BODY_HEIGHT} padding="0">
        <Dashboard>
          <Dashboard.Header
            BackButton={
              <BackButton onClick={handleBack}>
                <Icon name="undo" size={20} />
              </BackButton>
            }
            DatePicker={
              <DatePicker
                selectedDate={selectedDate}
                availableDates={availableDates}
                showDatePicker={showDatePicker}
                onToggle={handleToggleDatePicker}
                onSelect={(date) => {
                  handleDateSelect(date)
                  handleCloseDatePicker()
                }}
                onClose={handleCloseDatePicker}
              />
            }
          />
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
