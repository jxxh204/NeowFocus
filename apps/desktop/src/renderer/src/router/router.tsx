import { useEffect } from 'react'
import SyncConflict from '@renderer/component/SyncConflict'
import { FocusPage } from '@renderer/page/focus'
import InputPage from '@renderer/page/input'
import SettingsPage from '@renderer/page/settings'
import DashboardPage from '@renderer/page/dashboard'
import { BrowserBlockingPage } from '@renderer/component/BrowserBlockingControl'
import { TinyWindowPage } from '@renderer/page/tinyWindow'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useTaskContext } from '@renderer/context/TaskContext'
import { ROUTES } from '@renderer/constants'

function Router() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { taskStatus, focusState } = useTaskContext()

  useEffect(() => {
    const focusRoute = pathname === ROUTES.FOCUS || pathname === ROUTES.TINY_WINDOW
    if (taskStatus === 'idle' && focusRoute) navigate(ROUTES.INPUT, { replace: true })
    else if (taskStatus !== 'idle' && pathname === ROUTES.INPUT)
      navigate(ROUTES.FOCUS, { replace: true })
    else if (focusState.conflicts?.length && pathname === ROUTES.TINY_WINDOW)
      navigate(ROUTES.FOCUS, { replace: true })
  }, [taskStatus, pathname, focusState.conflicts?.length, navigate])

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

  if (focusState.conflicts?.length && pathname !== ROUTES.SETTINGS) return <SyncConflict />

  return (
    <>
      <Routes>
        <Route path={ROUTES.INPUT} element={<InputPage />} />
        <Route path={ROUTES.FOCUS} element={<FocusPage />} />
        <Route path={ROUTES.TINY_WINDOW} element={<TinyWindowPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path="/blocking" element={<BrowserBlockingPage />} />
      </Routes>
    </>
  )
}

export default Router
