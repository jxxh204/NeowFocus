import { HashRouter } from 'react-router-dom'
import Router from './router/router'
import { TimerProvider } from './context/TimerContext'
import { PopupProvider } from './context/PopupContext'

function App() {
  return (
    <div className="App">
      <HashRouter>
        <TimerProvider>
          <PopupProvider>
            <Router />
          </PopupProvider>
        </TimerProvider>
      </HashRouter>
    </div>
  )
}

export default App
