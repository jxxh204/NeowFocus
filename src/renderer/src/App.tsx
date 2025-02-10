import { HashRouter } from 'react-router-dom'
import Router from './router/router'
import { TimerProvider } from './context/TimerContext'

function App() {
  // const { ipcRenderer } = window.require("electron");

  return (
    <div className="App">
      <HashRouter>
        <TimerProvider>
          <Router />
        </TimerProvider>
      </HashRouter>
    </div>
  )
}

export default App
