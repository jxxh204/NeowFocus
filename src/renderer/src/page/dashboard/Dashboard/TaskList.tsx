import { GroupedByName } from '../useDashboard'
import { TaskCard, TaskName, PawContainer, PawSvg } from '../styles'

interface DashboardTaskListProps {
  tasks: GroupedByName[]
  themeColor: string
}

function DashboardTaskList({ tasks, themeColor }: DashboardTaskListProps) {
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
