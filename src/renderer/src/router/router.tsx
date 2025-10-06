import { FocusPage } from '@renderer/page/focus'
import InputPage from '@renderer/page/input'
import { TinyWindowPage } from '@renderer/page/tinyWindow'
import { Route, Routes } from 'react-router-dom'
import { ROUTES } from '@renderer/constants'

function Router() {
  return (
    <Routes>
      <Route path={ROUTES.INPUT} element={<InputPage />} />
      <Route path={ROUTES.FOCUS} element={<FocusPage />} />
      <Route path={ROUTES.TINY_WINDOW} element={<TinyWindowPage />} />
    </Routes>
  )
}

export default Router
