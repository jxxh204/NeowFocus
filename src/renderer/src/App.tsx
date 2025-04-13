import { HashRouter } from 'react-router-dom'
import Router from './router/router'
import { PopupProvider } from './context/PopupContext'
import { TaskProvider } from './context/TaskContext'

function App() {
  return (
    <div className="App">
      <HashRouter>
        <TaskProvider>
          <PopupProvider>
            <Router />
          </PopupProvider>
        </TaskProvider>
      </HashRouter>
    </div>
  )
}

export default App
