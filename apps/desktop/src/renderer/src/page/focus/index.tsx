import { useTaskContext } from '@renderer/context/TaskContext'
import FocusRunning from './FocusRunning'
import FocusCompleted from './FocusCompleted'

export function FocusPage(): JSX.Element {
  const { currentTask } = useTaskContext()
  const isCompleted = currentTask?.taskStatus === 'end'

  return isCompleted ? <FocusCompleted /> : <FocusRunning />
}
