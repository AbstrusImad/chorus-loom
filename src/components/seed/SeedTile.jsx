// SeedTile.jsx
// A living tile on the Seed Table. Holds a floating label and an embedded field.
// The tile lifts and brightens when focused so the table feels composed rather
// than form like.

import { motion } from 'framer-motion'

export default function SeedTile({ label, hint, children, span = 1, delay = 0 }) {
  return (
    <motion.div
      className="relative rounded-3xl p-5"
      style={{
        background: 'linear-gradient(180deg, var(--ink2), var(--ink1))',
        border: '1px solid var(--line2)',
        gridColumn: `span ${span}`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-[10px] tracking-wide-mono uppercase" style={{ color: 'var(--sage-text)' }}>
          {label}
        </span>
        {hint ? (
          <span className="font-body text-[11px]" style={{ color: 'var(--mute)' }}>
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </motion.div>
  )
}
