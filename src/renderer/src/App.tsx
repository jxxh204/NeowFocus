import { HashRouter } from 'react-router-dom'
import Router from './router/router'
import { TaskProvider } from './context/TaskContext'
import { SettingsProvider } from './context/SettingsContext'

function App() {
  return (
    <div className="App">
      <SettingsProvider>
        <TaskProvider>
          <HashRouter>
            <Router />
          </HashRouter>
        </TaskProvider>
      </SettingsProvider>
    </div>
  )
}

export default App
