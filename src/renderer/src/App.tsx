import { HashRouter } from 'react-router-dom'
import Router from './router/router'
import { PopupProvider } from './context/PopupContext'
import { TaskProvider } from './context/TaskContext'

function App() {
  return (
    <div className="App">
      <TaskProvider>
        <HashRouter>
          <PopupProvider>
            <Router />
          </PopupProvider>
        </HashRouter>
      </TaskProvider>
    </div>
  )
}

export default App
