// KnotPulse.jsx
// A knot rendered as a living torsion: a coiled, vibrating mark whose energy
// reflects severity. High knots twist faster and burn with the crimson accent.
// Clicking opens the knot for resolution.

import { motion } from 'framer-motion'

const SEVERITY = {
  High: { accent: 'crimson', speed: 2.4, coils: 5 },
  Medium: { accent: 'ember', speed: 4, coils: 4 },
  Low: { accent: 'champagne', speed: 6, coils: 3 }
}

function spiralPath(coils, radius) {
  const pts = []
  const steps = coils * 24
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const angle = t * coils * Math.PI * 2
    const rr = radius * t
    pts.push(`${48 + Math.cos(angle) * rr},${48 + Math.sin(angle) * rr}`)
  }
  return 'M ' + pts.join(' L ')
}

export default function KnotPulse({ knot, onClick, motionLevel = 0.85 }) {
  const cfg = SEVERITY[knot.severity] || SEVERITY.Low
  const path = spiralPath(cfg.coils, 38)
  const m = motionLevel

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center gap-3 rounded-3xl p-5 text-center"
      style={{ background: 'var(--ink2)', border: `1px solid var(--line2)`, width: 220 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: `0 0 30px var(--${cfg.accent}-glow)` }}
    >
      <div className="relative" style={{ width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96">
          <motion.path
            d={path}
            fill="none"
            stroke={`var(--${cfg.accent})`}
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ originX: '48px', originY: '48px' }}
            animate={m > 0 ? { rotate: 360 } : {}}
            transition={{ duration: cfg.speed * 6, repeat: Infinity, ease: 'linear' }}
          />
          <motion.circle
            cx="48"
            cy="48"
            r="6"
            fill={`var(--${cfg.accent})`}
            animate={m > 0 ? { scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: cfg.speed / 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '48px', originY: '48px', filter: `drop-shadow(0 0 8px var(--${cfg.accent}-glow))` }}
          />
        </svg>
      </div>
      <div>
        <div className="font-display text-sm" style={{ color: 'var(--bone)' }}>
          {knot.name}
        </div>
        <div
          className="font-mono text-[9px] tracking-wide-mono uppercase mt-1"
          style={{ color: `var(--${cfg.accent}-text, var(--ash))` }}
        >
          {knot.severity} tension
        </div>
      </div>
    </motion.button>
  )
}
