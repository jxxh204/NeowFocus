import { HashRouter } from 'react-router-dom'
import Router from './router/router'

function App() {
  // const { ipcRenderer } = window.require("electron");

  return (
    <div className="App">
      <HashRouter>
        <Router />
      </HashRouter>
    </div>
  )
}

export default App
