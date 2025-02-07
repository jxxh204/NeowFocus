import { FocusPage } from '@renderer/page/focus'
import InputPage from '@renderer/page/input'
import MiniMizeFocus from '@renderer/page/minimizeFocus'
import { Route, Routes } from 'react-router-dom'

function Router() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/focus" element={<FocusPage />} />
      <Route path="/minimize_focus" element={<MiniMizeFocus />} />
    </Routes>
  )
}

export default Router
