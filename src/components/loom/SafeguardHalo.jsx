// SafeguardHalo.jsx
// A safeguard rendered as a soft protective halo chip. When active it carries a
// gentle ring that signals protection over the weave.

import { motion } from 'framer-motion'

export default function SafeguardHalo({ safeguard, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="relative text-left rounded-2xl px-4 py-3 w-full transition-all duration-500 ease-loom"
      style={{
        background: active ? 'var(--ink4)' : 'var(--ink2)',
        border: active ? '1px solid var(--champagne)' : '1px solid var(--line1)'
      }}
    >
      {active ? (
        <motion.span
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: '1px solid var(--champagne)' }}
          initial={{ opacity: 0.5, scale: 0.98 }}
          animate={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
        />
      ) : null}
      <div className="font-body text-sm" style={{ color: active ? 'var(--champagne-text)' : 'var(--bone2)' }}>
        {safeguard.name}
      </div>
      <div className="font-body text-xs mt-0.5" style={{ color: 'var(--ash)' }}>
        {safeguard.note}
      </div>
    </motion.button>
  )
}
