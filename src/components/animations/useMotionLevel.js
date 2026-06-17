// useMotionLevel.js
// Resolves how much motion is permitted, combining the OS prefers-reduced-motion
// setting with the in app settings. Returns a number 0..1 where 0 means motion
// should be effectively off.

import { useEffect, useState } from 'react'
import { useApp } from '../../store/AppStore.jsx'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    if (mq.addEventListener) mq.addEventListener('change', update)
    else mq.addListener(update)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      else mq.removeListener(update)
    }
  }, [])
  return reduced
}

export function useMotionLevel() {
  const { state } = useApp()
  const prefersReduced = usePrefersReducedMotion()
  if (prefersReduced || state.settings.reducedMotion) return 0
  return state.settings.animationIntensity
}
