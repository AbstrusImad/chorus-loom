// ThreadField.jsx
// The ambient backdrop of Chorus Loom: suspended threads of light that weave and
// drift, responding gently to the cursor. Rendered on a canvas with device pixel
// ratio awareness. Pauses when the tab is hidden and when motion is disabled.

import { useEffect, useRef } from 'react'
import { useMotionLevel } from './useMotionLevel.js'

function readVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

export default function ThreadField({ density = 0.5, tempo = 0.4, hue = 'sage' }) {
  const canvasRef = useRef(null)
  const motion = useMotionLevel()
  const motionRef = useRef(motion)
  motionRef.current = motion
  const paramsRef = useRef({ density, tempo, hue })
  paramsRef.current = { density, tempo, hue }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    let raf = 0
    let width = 0
    let height = 0
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const pointer = { x: 0.5, y: 0.5, active: false }
    let threads = []

    function buildThreads() {
      const count = Math.round(10 + paramsRef.current.density * 26)
      threads = []
      for (let i = 0; i < count; i += 1) {
        threads.push({
          baseY: (i + 0.5) / count,
          amp: 0.02 + Math.random() * 0.08,
          freq: 0.6 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.8,
          alpha: 0.05 + Math.random() * 0.16
        })
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function colorFor() {
      const h = paramsRef.current.hue
      if (h === 'champagne') return readVar('--champagne', '#7DD3E0')
      if (h === 'crimson') return readVar('--crimson', '#D86969')
      if (h === 'ember') return readVar('--ember', '#5E7A8C')
      return readVar('--sage', '#6B9FE3')
    }

    let t = 0
    function frame() {
      raf = requestAnimationFrame(frame)
      if (document.hidden) return
      const m = motionRef.current
      ctx.clearRect(0, 0, width, height)
      const stroke = colorFor()
      const speedScale = m === 0 ? 0 : (0.4 + paramsRef.current.tempo) * (0.4 + m)
      t += 0.006 * speedScale

      for (let i = 0; i < threads.length; i += 1) {
        const th = threads[i]
        const y0 = th.baseY * height
        ctx.beginPath()
        const segs = 48
        for (let s = 0; s <= segs; s += 1) {
          const x = (s / segs) * width
          const nx = s / segs
          const pull = pointer.active
            ? Math.exp(-Math.pow((nx - pointer.x) * 3.2, 2)) * (pointer.y - th.baseY) * 90 * (0.3 + m)
            : 0
          const wave =
            Math.sin(nx * th.freq * Math.PI * 2 + th.phase + t * th.speed) * th.amp * height
          const y = y0 + wave + pull
          if (s === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = stroke
        ctx.globalAlpha = th.alpha * (0.5 + m * 0.7)
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect()
      pointer.x = (e.clientX - rect.left) / rect.width
      pointer.y = (e.clientY - rect.top) / rect.height
      pointer.active = true
    }
    function onLeave() {
      pointer.active = false
    }

    resize()
    buildThreads()
    frame()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerout', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
