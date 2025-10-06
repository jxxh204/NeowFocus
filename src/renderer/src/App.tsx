import { HashRouter } from 'react-router-dom'
import Router from './router/router'
import { TaskProvider } from './context/TaskContext'

function App() {
  return (
    <div className="App">
      <TaskProvider>
        <HashRouter>
          <Router />
        </HashRouter>
      </TaskProvider>
    </div>
  )
}

export default App
