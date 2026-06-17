// RoleOrb.jsx
// A role rendered as a floating orb, a voice in the chorus. Hovering lifts it
// with magnetic attraction. Selected orbs glow with their accent.

import { motion } from 'framer-motion'

export default function RoleOrb({ role, selected, dimmed, onClick, size = 76, floatSeed = 0 }) {
  const accent = role.accent || 'sage'
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: selected ? 'var(--ink4)' : 'var(--ink2)',
        border: selected ? `1px solid var(--${accent})` : '1px solid var(--line2)',
        boxShadow: selected ? `0 0 32px var(--${accent}-glow)` : 'none',
        opacity: dimmed ? 0.4 : 1
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: dimmed ? 0.4 : 1,
        y: [0, -4, 0, 4, 0]
      }}
      transition={{
        scale: { type: 'spring', stiffness: 300, damping: 24 },
        opacity: { duration: 0.4 },
        y: { duration: 6 + floatSeed, repeat: Infinity, ease: 'easeInOut' }
      }}
      whileHover={{ scale: 1.08, y: -6 }}
      whileTap={{ scale: 0.94 }}
      title={role.essence}
    >
      <span
        className="font-display text-lg"
        style={{ color: selected ? `var(--${accent}-text, var(--bone))` : 'var(--bone2)' }}
      >
        {role.glyph}
      </span>
      <span className="font-mono text-[8px] tracking-wide-mono uppercase mt-0.5" style={{ color: 'var(--ash)' }}>
        {role.name}
      </span>
      {selected ? (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid var(--${accent})` }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
      ) : null}
    </motion.button>
  )
}
