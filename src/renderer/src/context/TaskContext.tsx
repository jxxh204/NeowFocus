import { InitialState } from '@renderer/hooks/useTask'
import React, { createContext, useContext } from 'react'
import { LocalStorageValue, T_ChangeHandler, TaskAction } from '@renderer/type/task'

type ProviderProps = {
  children: React.ReactNode
  value: InitialState
  storage: LocalStorageValue<InitialState>
  dispatch: React.Dispatch<TaskAction>
  onChangeHandler: T_ChangeHandler
}

const TaskContext = createContext<InitialState | null>(null)
const StorageContext = createContext<LocalStorageValue<InitialState> | null>(null)
const TaskDispatchContext = createContext<React.Dispatch<TaskAction> | null>(null)
const TaskChangeContext = createContext<null | T_ChangeHandler>(null)

function TaskProvider({ children, value, storage, dispatch, onChangeHandler }: ProviderProps) {
  return (
    <TaskContext.Provider value={value}>
      <StorageContext.Provider value={storage}>
        <TaskChangeContext.Provider value={onChangeHandler}>
          <TaskDispatchContext.Provider value={dispatch}>{children}</TaskDispatchContext.Provider>
        </TaskChangeContext.Provider>
      </StorageContext.Provider>
    </TaskContext.Provider>
  )
}

function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('Task 컨텍스트 없음.')
  }

  return context
}

function useTaskChangeContext() {
  const onChange = useContext(TaskChangeContext)
  if (!onChange) {
    throw new Error('TaskChange 컨텍스트 없음.')
  }
  return { onChange }
}

function useTaskDispatchContext() {
  const dispatch = useContext(TaskDispatchContext)
  if (!dispatch) {
    throw new Error('Task dispatch 컨텍스트 없음.')
  }
  return { dispatch }
}

function useStorage() {
  const storage = useContext(StorageContext)
  if (!storage) {
    throw new Error('LocalStorage 컨텍스트 없음.')
  }
  return { storage }
}

export { TaskProvider, useTaskContext, useTaskChangeContext, useTaskDispatchContext, useStorage }
