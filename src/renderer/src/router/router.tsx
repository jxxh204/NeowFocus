import { FocusDefault } from '@renderer/page/focus'
import Input from '@renderer/page/input'
import MiniMizeFocus from '@renderer/page/minimizeFocus'
import { Route, Routes } from 'react-router-dom'

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Input />} />
      <Route path="/focus" element={<FocusDefault />} />
      <Route path="/minimize_focus" element={<MiniMizeFocus />} />
    </Routes>
  )
}

export default Router
