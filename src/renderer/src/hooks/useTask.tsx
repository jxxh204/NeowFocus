import { useEffect, useReducer } from 'react'
import { TaskAction, TaskName } from '../types/task'
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
      return { ...state, [action.name ? action.name : '']: action.value }
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
    console.log('🚀 ~ useEffect ~ useEffect: context', storage, task)

    setStorage(task) // 스토리지, 태스크를 합쳐야할까?
  }, [task])
  //모든 변경사항을 수집해야함.

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
