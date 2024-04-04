import { ChangeEventHandler } from 'react'

export type TaskType = 'SET_TASK' | 'INIT_TASK'
export type TaskName = 'taskName' | 'minute' | 'time' | 'done' | 'date'
export type TaskAction = {
  type: TaskType
  name?: TaskName
  value?: string | number | boolean
}
export type T_ChangeHandler = ChangeEventHandler<HTMLInputElement>

export type LocalStorageValue<T> = T | null
