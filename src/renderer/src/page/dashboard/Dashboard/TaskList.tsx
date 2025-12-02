import { GroupedByName } from '../useDashboard'
import { TaskCard, TaskName, PawContainer, PawSvg } from '../styles'

interface DashboardTaskListProps {
  tasks: GroupedByName[]
  themeColor: string
  Empty: React.ComponentType
}

function DashboardTaskList({ tasks, themeColor, Empty }: DashboardTaskListProps) {
  if (tasks.length === 0) {
    return <Empty />
  }

  return (
    <>
      {tasks.map((group, index) => (
        <TaskCard key={`${group.taskName}-${index}`}>
          <TaskName>{group.taskName}</TaskName>
          <PawContainer>
            {Array.from({ length: group.count }).map((_, i) => (
              <PawSvg key={i} color={themeColor} size={20} />
            ))}
          </PawContainer>
        </TaskCard>
      ))}
    </>
  )
}

export default DashboardTaskList
