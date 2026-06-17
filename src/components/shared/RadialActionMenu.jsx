// RadialActionMenu.jsx
// A small radial menu of actions that fan out from a center point. Used on relic
// capsules so actions feel like petals opening rather than a context menu.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RadialActionMenu({ actions = [] }) {
  const [open, setOpen] = useState(false)
  const radius = 58
  const start = -90
  const span = actions.length > 1 ? 150 : 0

  return (
    <div className="relative" style={{ width: 36, height: 36 }}>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.9 }}
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm"
        style={{ background: 'var(--ink4)', border: '1px solid var(--line2)', color: 'var(--bone)' }}
        animate={{ rotate: open ? 45 : 0 }}
        title="Actions"
      >
        +
      </motion.button>
      <AnimatePresence>
        {open
          ? actions.map((a, i) => {
              const angle = ((start + (actions.length > 1 ? (span / (actions.length - 1)) * i : 0)) * Math.PI) / 180
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              return (
                <motion.button
                  key={a.label}
                  type="button"
                  onClick={() => {
                    a.onClick()
                    setOpen(false)
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ x, y, opacity: 1, scale: 1 }}
                  exit={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28, delay: i * 0.02 }}
                  whileHover={{ scale: 1.1, boxShadow: `0 0 18px var(--${a.accent || 'sage'}-glow)` }}
                  className="absolute left-1/2 top-1/2 z-20 flex h-9 items-center justify-center rounded-full px-3 font-mono text-[10px] uppercase tracking-wide-mono"
                  style={{
                    translateX: '-50%',
                    translateY: '-50%',
                    background: 'var(--ink2)',
                    border: `1px solid var(--${a.accent || 'sage'})`,
                    color: `var(--${a.accent || 'sage'}-text, var(--bone))`,
                    whiteSpace: 'nowrap'
                  }}
                  title={a.label}
                >
                  {a.label}
                </motion.button>
              )
            })
          : null}
      </AnimatePresence>
    </div>
  )
}
