import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaskContext, Task } from '@renderer/context/TaskContext'
import { useSettingsContext } from '@renderer/context/SettingsContext'
import { WINDOW_SIZE, IPC_CHANNELS, ROUTES } from '@renderer/constants'

const DASHBOARD_BODY_HEIGHT = 400
const DASHBOARD_WINDOW_HEIGHT = WINDOW_SIZE.TOP_SECTION_HEIGHT + DASHBOARD_BODY_HEIGHT

// 같은 작업 이름을 가진 태스크 그룹화
export type GroupedByName = {
  taskName: string
  count: number
}

// 날짜 포맷 (YYYY-MM-DD -> YYYY.M.D)
export const formatDateDisplay = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-')
  return `${year}.${parseInt(month)}.${parseInt(day)}`
}

export const useDashboard = () => {
  const navigate = useNavigate()
  const { dailyTaskList } = useTaskContext()
  const { themeColorValue } = useSettingsContext()
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

  // 윈도우 크기 설정
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

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker)
  }

  const closeDatePicker = () => {
    setShowDatePicker(false)
  }

  return {
    // 상태
    showDatePicker,
    selectedDate,
    availableDates,
    groupedTasks,
    themeColorValue,
    dailyTaskList,
    // 상수
    DASHBOARD_BODY_HEIGHT,
    // 핸들러
    handleBack,
    handleDateSelect,
    toggleDatePicker,
    closeDatePicker
  }
}
