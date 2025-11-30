import { useEffect } from 'react'
import { FocusPage } from '@renderer/page/focus'
import InputPage from '@renderer/page/input'
import SettingsPage from '@renderer/page/settings'
import DashboardPage from '@renderer/page/dashboard'
import { TinyWindowPage } from '@renderer/page/tinyWindow'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { ROUTES } from '@renderer/constants'

function Router() {
  const navigate = useNavigate()

  useEffect(() => {
    // Main 프로세스에서 NAVIGATE_TO 이벤트 수신
    const electron = window.electron as {
      onNavigateTo?: (callback: (route: string) => void) => (() => void) | void
    }
    let cleanup: (() => void) | void

    if (electron?.onNavigateTo) {
      cleanup = electron.onNavigateTo((route: string) => {
        navigate(route)
      })
    }

    return () => {
      if (cleanup) cleanup()
    }
  }, [navigate])

  return (
    <Routes>
      <Route path={ROUTES.INPUT} element={<InputPage />} />
      <Route path={ROUTES.FOCUS} element={<FocusPage />} />
      <Route path={ROUTES.TINY_WINDOW} element={<TinyWindowPage />} />
      <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
    </Routes>
  )
}

export default Router
