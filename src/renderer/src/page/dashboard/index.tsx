import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import { WINDOW_SIZE, IPC_CHANNELS, ROUTES } from '@renderer/constants'
import { useTaskContext, Task } from '@renderer/context/TaskContext'

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 0 12px 12px 12px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.color.text.secondary};
    border-radius: 2px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  flex-shrink: 0;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: ${({ theme }) => theme.color.text.primary};
  padding: 0;

  &:hover {
    opacity: 0.7;
  }
`

const Title = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`

const DateSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: ${({ theme }) => theme.color.input.background};
  border: 1px solid ${({ theme }) => theme.color.container.border};
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.primary};

  &:hover {
    background: ${({ theme }) => theme.color.button.hover};
  }
`

const DateArrow = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.color.text.secondary};
`

const TaskCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: ${({ theme }) => theme.color.input.background};
  border-radius: 12px;
`

const TaskName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text.primary};
  word-break: break-word;
`

const PawContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 13px;
  text-align: center;
  gap: 12px;
  white-space: pre-line;
`

const DatePickerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const DatePickerModal = styled.div`
  background: ${({ theme }) => theme.color.container.background};
  border-radius: 12px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  min-width: 150px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.color.text.secondary};
    border-radius: 2px;
  }
`

const DateOption = styled.button<{ $isSelected: boolean }>`
  display: block;
  width: 100%;
  padding: 10px 12px;
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.color.primary[500] : 'transparent'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.color.black : theme.color.text.primary};
  text-align: left;

  &:hover {
    background: ${({ $isSelected, theme }) =>
      $isSelected ? theme.color.primary[500] : theme.color.button.hover};
  }
`

const DASHBOARD_BODY_HEIGHT = 400
const DASHBOARD_WINDOW_HEIGHT =
  WINDOW_SIZE.TOP_SECTION_HEIGHT + DASHBOARD_BODY_HEIGHT

// 날짜 포맷 (YYYY-MM-DD -> YYYY.M.D)
const formatDateDisplay = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-')
  return `${year}.${parseInt(month)}.${parseInt(day)}`
}

// 같은 작업 이름을 가진 태스크 그룹화
type GroupedByName = {
  taskName: string
  count: number
}

function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { dailyTaskList } = useTaskContext()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  // 사용 가능한 날짜 목록
  const availableDates = useMemo(() => {
    return dailyTaskList.map((day) => day.date)
  }, [dailyTaskList])

  // 초기 날짜 설정
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0])
    }
  }, [availableDates, selectedDate])

  useEffect(() => {
    window.message?.send(IPC_CHANNELS.WINDOW_SIZE_CHANGE, {
      width: WINDOW_SIZE.DEFAULT_WIDTH,
      height: DASHBOARD_WINDOW_HEIGHT
    })
  }, [])

  const handleBack = () => {
    navigate(ROUTES.INPUT)
  }

  // 선택된 날짜의 태스크들
  const selectedDayTasks = useMemo(() => {
    const dayData = dailyTaskList.find((day) => day.date === selectedDate)
    return dayData?.tasks || []
  }, [dailyTaskList, selectedDate])

  // 같은 이름의 태스크를 그룹화
  const groupedTasks = useMemo((): GroupedByName[] => {
    const grouped: Record<string, number> = {}
    selectedDayTasks.forEach((task: Task) => {
      if (!grouped[task.taskName]) {
        grouped[task.taskName] = 0
      }
      grouped[task.taskName] += 1
    })
    return Object.entries(grouped).map(([taskName, count]) => ({
      taskName,
      count
    }))
  }, [selectedDayTasks])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setShowDatePicker(false)
  }

  return (
    <Container width={400}>
      <Container.Top height={WINDOW_SIZE.TOP_SECTION_HEIGHT}>
        <div />
      </Container.Top>
      <Container.Body height={DASHBOARD_BODY_HEIGHT} padding="0">
        <DashboardContainer>
          <Header>
            <HeaderLeft>
              <BackButton onClick={handleBack}>‹</BackButton>
              <Title>{t('dashboard.title')}</Title>
            </HeaderLeft>
            {availableDates.length > 0 && (
              <DateSelector onClick={() => setShowDatePicker(true)}>
                {selectedDate ? formatDateDisplay(selectedDate) : ''}
                <DateArrow>▼</DateArrow>
              </DateSelector>
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
                    <Icon key={i} name="paw_white" size={24} />
                  ))}
                </PawContainer>
              </TaskCard>
            ))
          )}
        </DashboardContainer>
      </Container.Body>

      {showDatePicker && (
        <DatePickerOverlay onClick={() => setShowDatePicker(false)}>
          <DatePickerModal onClick={(e) => e.stopPropagation()}>
            {availableDates.map((date) => (
              <DateOption
                key={date}
                $isSelected={date === selectedDate}
                onClick={() => handleDateSelect(date)}
              >
                {formatDateDisplay(date)}
              </DateOption>
            ))}
          </DatePickerModal>
        </DatePickerOverlay>
      )}
    </Container>
  )
}

export default DashboardPage
