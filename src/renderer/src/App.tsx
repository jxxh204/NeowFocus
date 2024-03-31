import React from 'react'
import useTask from './hooks/useTask'
import { TaskProvider } from './context/TaskContext'
import { HashRouter } from 'react-router-dom'
import Router from './router/router'

function App() {
  const { task, storage, taskDispatch, onChange } = useTask()
  // const { ipcRenderer } = window.require("electron");

  return (
    <div className="App">
      <TaskProvider
        value={task}
        storage={storage}
        dispatch={taskDispatch}
        onChangeHandler={onChange}
      >
        <HashRouter>
          <Router />
        </HashRouter>
      </TaskProvider>
    </div>
  )
}

export default App
