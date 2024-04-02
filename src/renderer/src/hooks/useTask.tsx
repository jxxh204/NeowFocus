import { useEffect, useReducer, useState } from 'react'
import { TaskAction, TaskName } from '../type/task'
import { useLocalStorage } from './useLocalStorage'

const initialState = {
  // 전역으로 돌려야할듯.
  taskName: '',
  timer: 0,
  minute: 0
  // endTime,
  //  saveTime
}
export type InitialState = typeof initialState

const reducer = (state: InitialState, action: TaskAction) => {
  switch (action.type) {
    case 'SET_TASK':
      return { ...state, [action.name]: action.value }
    // case "SET_NAME":
    //   return { ...state, taskName: action.value };
    // case "SET_TIMER":
    //   return { ...state, timer: action.value };
    // case "SET_DATE":
    //   return { ...state, date: action.value };
    default:
      return state
  }
}

function useTask() {
  const [task, taskDispatch] = useReducer(reducer, initialState)
  const [countDown, setCountDown] = useState()
  const [storage, setStorage] = useLocalStorage('task', task)

  useEffect(() => {
    // if (!storage?.taskName)
    setStorage(task)
    console.log(task)
  }, [task])

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
