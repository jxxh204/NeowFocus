import { useTranslation } from 'react-i18next'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import { useDashboard } from './useDashboard'
import DatePicker from './DatePicker'
import {
  DashboardContainer,
  Header,
  HeaderLeft,
  BackButton,
  Title,
  TaskCard,
  TaskName,
  PawContainer,
  PawSvg,
  EmptyMessage
} from './styles'

function DashboardPage() {
  const { t } = useTranslation()
  const {
    showDatePicker,
    selectedDate,
    availableDates,
    groupedTasks,
    themeColorValue,
    dailyTaskList,
    DASHBOARD_TOP_SECTION_HEIGHT,
    DASHBOARD_BODY_HEIGHT,
    handleBack,
    handleDateSelect,
    toggleDatePicker,
    closeDatePicker
  } = useDashboard()

  return (
    <Container width={400}>
      <Container.Top height={DASHBOARD_TOP_SECTION_HEIGHT}>
        <div />
      </Container.Top>
      <Container.Body height={DASHBOARD_BODY_HEIGHT} padding="0">
        <DashboardContainer>
          <Header>
            <HeaderLeft>
              <BackButton onClick={handleBack}>
                <Icon name="undo" size={20} />
              </BackButton>
              <Title>{t('dashboard.title')}</Title>
            </HeaderLeft>
            <DatePicker
              selectedDate={selectedDate}
              availableDates={availableDates}
              showDatePicker={showDatePicker}
              onToggle={toggleDatePicker}
              onSelect={handleDateSelect}
              onClose={closeDatePicker}
            />
          </Header>

          {dailyTaskList.length === 0 ? (
            <EmptyMessage>
              <Icon name="paw_white" size={40} />
              {t('dashboard.empty')}
            </EmptyMessage>
          ) : (
            groupedTasks.map((group, index) => (
              <TaskCard key={`${group.taskName}-${index}`}>
                <TaskName>{group.taskName}</TaskName>
                <PawContainer>
                  {Array.from({ length: group.count }).map((_, i) => (
                    <PawSvg key={i} color={themeColorValue} size={20} />
                  ))}
                </PawContainer>
              </TaskCard>
            ))
          )}
        </DashboardContainer>
      </Container.Body>
    </Container>
  )
}

export default DashboardPage
