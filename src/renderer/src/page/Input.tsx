import Button from '@renderer/component/Button'
import Header from '@renderer/component/Header'
import InputTask from '@renderer/component/InputTask'
import Main from '@renderer/component/Main'
import SelectTimer from '@renderer/component/SelectTime/SelectTimer'
import Time from '@renderer/component/SelectTime/Time'
import {
  useTaskChangeContext,
  useTaskContext,
  useTaskDispatchContext
} from '@renderer/context/TaskContext'
import { useNavigate } from 'react-router-dom'

function Input() {
  const task = useTaskContext()
  const { dispatch } = useTaskDispatchContext()
  const changeContext = useTaskChangeContext()
  const navigate = useNavigate()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!task?.taskName) return alert('태스크를 입력해주세요.')
    if (!task?.minute) return alert('time을 선택해주세요.')
    // 유효성 검사.
    dispatch({ name: 'date', type: 'SET_TASK', value: new Date().getTime() })
    navigate('/focus')
  }
  return (
    <>
      <Header name="작업 이름" />
      <Main onSubmit={onSubmit}>
        <InputTask name="taskName" onChange={changeContext?.onChange} />

        <SelectTimer value={task?.minute} name="minute" onChange={changeContext?.onChange}>
          <Time value="20">20분</Time>
          <Time value="40">40분</Time>
          <Time value="60">60분</Time>
        </SelectTimer>
        {task.minute && task.taskName ? <Button type="submit" name="집중 시작!" /> : null}
      </Main>
    </>
  )
}

export default Input
