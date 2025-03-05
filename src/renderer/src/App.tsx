import { HashRouter } from 'react-router-dom'
import Router from './router/router'
import { TimerProvider } from './context/TimerContext'
import { PopupProvider } from './context/PopupContext'
import { TaskProvider } from './context/TaskContext'

function App() {
  return (
    <div className="App">
      <HashRouter>
        <TaskProvider>
          <TimerProvider>
            <PopupProvider>
              <Router />
            </PopupProvider>
          </TimerProvider>
        </TaskProvider>
      </HashRouter>
    </div>
  )
}

export default App
