import { useTranslation } from 'react-i18next'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import { WINDOW_SIZE } from '@renderer/constants'
import { useDashboard, formatDateDisplay } from './useDashboard'
import {
  DashboardContainer,
  Header,
  HeaderLeft,
  BackButton,
  Title,
  DateSelectorWrapper,
  DateSelector,
  DateArrow,
  TaskCard,
  TaskName,
  PawContainer,
  PawSvg,
  EmptyMessage,
  DatePickerOverlay,
  DatePickerDropdown,
  DateOption
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
    DASHBOARD_BODY_HEIGHT,
    handleBack,
    handleDateSelect,
    toggleDatePicker,
    closeDatePicker
  } = useDashboard()

  return (
    <Container width={400}>
      <Container.Top height={WINDOW_SIZE.TOP_SECTION_HEIGHT}>
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
            {availableDates.length > 0 && (
              <DateSelectorWrapper>
                <DateSelector onClick={toggleDatePicker}>
                  {selectedDate ? formatDateDisplay(selectedDate) : ''}
                  <DateArrow>▼</DateArrow>
                </DateSelector>
                {showDatePicker && (
                  <DatePickerDropdown>
                    {availableDates.map((date) => (
                      <DateOption
                        key={date}
                        $isSelected={date === selectedDate}
                        onClick={() => handleDateSelect(date)}
                      >
                        {formatDateDisplay(date)}
                      </DateOption>
                    ))}
                  </DatePickerDropdown>
                )}
              </DateSelectorWrapper>
            )}
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

      {showDatePicker && <DatePickerOverlay onClick={closeDatePicker} />}
    </Container>
  )
}

export default DashboardPage
