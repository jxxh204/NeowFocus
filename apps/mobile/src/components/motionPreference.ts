import { useEffect, useState } from 'react'
import { AccessibilityInfo, AppState } from 'react-native'

export function useMotionPreference() {
  const [reduced, setReduced] = useState<boolean | null>(null)
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive')
  useEffect(() => {
    let mounted = true
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduced(value) })
      .catch(() => { if (mounted) setReduced(true) })
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    const app = AppState.addEventListener('change', state => setActive(state === 'active'))
    return () => { mounted = false; motion.remove(); app.remove() }
  }, [])
  return { reduced, active }
}
