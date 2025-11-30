import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Container from '@components/Container'
import Icon from '@renderer/component/ui/Icon'
import MinimizeButton from '@components/MinimizeButton'
import { WINDOW_SIZE, IPC_CHANNELS, ROUTES, TIME } from '@renderer/constants'
import { useTaskContext, DailyTaskSummary } from '@renderer/context/TaskContext'

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 12px;
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

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
  flex-shrink: 0;
`

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 13px;
  text-align: center;
  gap: 8px;
  white-space: pre-line;
`

const DayCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.color.input.background};
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`

const DayHeader = styled.button<{ $isOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.color.button.hover};
  }
`

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const DateText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`

const DaySummary = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.color.text.secondary};
`

const ToggleIcon = styled.span<{ $isOpen: boolean }>`
  font-size: 10px;
  color: ${({ theme }) => theme.color.text.secondary};
  transform: rotate(${({ $isOpen }) => ($isOpen ? '180deg' : '0deg')});
  transition: transform 0.2s ease;
`

const TaskList = styled.div<{ $isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${({ $isOpen }) => ($isOpen ? '0 12px 10px 12px' : '0')};
  max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: all 0.2s ease;
`

const TaskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: ${({ theme }) => theme.color.container.background};
  border-radius: 4px;
`

const TaskName = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.primary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const TaskDuration = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.color.text.secondary};
  margin-left: 8px;
`

const DASHBOARD_BODY_HEIGHT = 400
const DASHBOARD_WINDOW_HEIGHT =
  WINDOW_SIZE.TOP_SECTION_HEIGHT + DASHBOARD_BODY_HEIGHT + WINDOW_SIZE.BOTTOM_SECTION_HEIGHT

// 초를 분 형식으로 변환
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / TIME.SECONDS_PER_MINUTE)
  return `${mins}분`
}

// 날짜 포맷 (YYYY-MM-DD -> MM/DD 또는 오늘/어제)
const formatDate = (dateStr: string, t: (key: string) => string): string => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (dateStr === today) return t('dashboard.today')
  if (dateStr === yesterday) return t('dashboard.yesterday')

  const [, month, day] = dateStr.split('-')
  return `${parseInt(month)}/${parseInt(day)}`
}

function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { dailyTaskList } = useTaskContext()
  const [openDays, setOpenDays] = useState<Set<string>>(new Set())

  useEffect(() => {
    window.message?.send(IPC_CHANNELS.WINDOW_SIZE_CHANGE, {
      width: WINDOW_SIZE.DEFAULT_WIDTH,
      height: DASHBOARD_WINDOW_HEIGHT
    })

    // 오늘 날짜는 기본으로 열어둠
    if (dailyTaskList.length > 0) {
      setOpenDays(new Set([dailyTaskList[0].date]))
    }
  }, [])

  const handleBack = () => {
    navigate(ROUTES.INPUT)
  }

  const toggleDay = (date: string) => {
    setOpenDays((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(date)) {
        newSet.delete(date)
      } else {
        newSet.add(date)
      }
      return newSet
    })
  }

  return (
    <Container width={400}>
      <Container.Top height={WINDOW_SIZE.TOP_SECTION_HEIGHT}>
        <Icon name="cat_face" alt="cat" size={24} />
        <MinimizeButton />
      </Container.Top>
      <Container.Body height={DASHBOARD_BODY_HEIGHT} padding="0">
        <DashboardContainer>
          <SectionTitle>{t('dashboard.title')}</SectionTitle>
          {dailyTaskList.length === 0 ? (
            <EmptyMessage>
              <Icon name="timer" size={32} />
              {t('dashboard.empty')}
            </EmptyMessage>
          ) : (
            dailyTaskList.map((day: DailyTaskSummary) => {
              const isOpen = openDays.has(day.date)
              return (
                <DayCard key={day.date}>
                  <DayHeader $isOpen={isOpen} onClick={() => toggleDay(day.date)}>
                    <DateInfo>
                      <DateText>{formatDate(day.date, t)}</DateText>
                      <DaySummary>
                        {day.totalCount}
                        {t('dashboard.sessions')} · {formatDuration(day.totalDuration)}
                      </DaySummary>
                    </DateInfo>
                    <ToggleIcon $isOpen={isOpen}>▼</ToggleIcon>
                  </DayHeader>
                  <TaskList $isOpen={isOpen}>
                    {day.tasks.map((task, index) => (
                      <TaskItem key={`${task.id}-${index}`}>
                        <TaskName>{task.taskName}</TaskName>
                        <TaskDuration>{formatDuration(task.fullDuration)}</TaskDuration>
                      </TaskItem>
                    ))}
                  </TaskList>
                </DayCard>
              )
            })
          )}
        </DashboardContainer>
      </Container.Body>
      <Container.Bottom height={WINDOW_SIZE.BOTTOM_SECTION_HEIGHT}>
        <Container.Button type="button" onClick={handleBack}>
          {t('dashboard.back')}
        </Container.Button>
      </Container.Bottom>
    </Container>
  )
}

export default DashboardPage
