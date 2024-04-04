import { useEffect, useReducer, useState } from 'react'
import { TaskAction, TaskName } from '../type/task'
import { useLocalStorage } from './useLocalStorage'
import useWindowSize from './useWindowSize'

const initialState = {
  // 전역으로 돌려야할듯.
  taskName: '',
  minute: 0,
  time: 0, // microSecond
  done: false
  //  saveTime
}
export type InitialState = typeof initialState

const reducer = (state: InitialState, action: TaskAction) => {
  switch (action.type) {
    case 'SET_TASK':
      return { ...state, [action.name]: action.value }
    case 'INIT_TASK':
      return {
        taskName: '',
        minute: 0,
        time: 0,
        done: false
      }

    default:
      return state
  }
}

function useTask() {
  const [task, taskDispatch] = useReducer(reducer, initialState)
  const [storage, setStorage] = useLocalStorage('task', task)
  const { setWindowSize } = useWindowSize()

  useEffect(() => {
    if (task?.taskName && task?.minute) {
      setWindowSize({ windowName: 'input' })
    } else {
      setWindowSize({ windowName: 'default-input' })
    }
  }, [task.taskName, task.minute])

  useEffect(() => {
    setStorage(task)
    console.log('useTask')
  }, [task.time])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as TaskName
    taskDispatch({
      type: `SET_TASK`,
      name: name,
      value: e.target.value
    })
  }
  return { storage, task, taskDispatch, onChange }
}

export default useTask
