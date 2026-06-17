// StageGlyph.jsx
// A gesture placed on the Loom Stage. Each glyph carries the gesture name and a
// small mark of its kind. Pauses breathe, tensions vibrate, actions pulse.

import { motion } from 'framer-motion'
import { PAUSE_KINDS, TENSION_KINDS, DECISION_KINDS, ACTION_KINDS, RECOVERY_KINDS } from '../../data/gestureLibrary.js'

function kindMark(kind) {
  if (PAUSE_KINDS.has(kind)) return 'rest'
  if (TENSION_KINDS.has(kind)) return 'tension'
  if (DECISION_KINDS.has(kind)) return 'decide'
  if (ACTION_KINDS.has(kind)) return 'act'
  if (RECOVERY_KINDS.has(kind)) return 'return'
  return kind
}

export default function StageGlyph({ gesture, index, active, selected, onClick, motionLevel = 0.85 }) {
  const accent = gesture.accent || 'sage'
  const kind = gesture.kind
  const breathing = PAUSE_KINDS.has(kind)
  const vibrating = TENSION_KINDS.has(kind)
  const pulsing = ACTION_KINDS.has(kind)
  const m = motionLevel

  const animate = active
    ? { scale: 1.12, boxShadow: `0 0 36px var(--${accent}-glow)` }
    : breathing
      ? { scale: [1, 1.04, 1], boxShadow: '0 0 0 rgba(0,0,0,0)' }
      : vibrating
        ? { x: m > 0 ? [0, -1.2, 1.2, -1, 1, 0] : 0 }
        : pulsing
          ? { boxShadow: m > 0 ? [`0 0 0 var(--${accent}-glow)`, `0 0 24px var(--${accent}-glow)`, `0 0 0 var(--${accent}-glow)`] : 'none' }
          : {}

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center justify-center rounded-2xl"
      style={{
        width: 92,
        height: 92,
        background: selected ? 'var(--ink4)' : 'var(--ink2)',
        border: selected ? `1px solid var(--${accent})` : '1px solid var(--line2)'
      }}
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1, ...animate }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.04 },
        y: { duration: 0.5, delay: index * 0.04 },
        scale: active ? { type: 'spring', stiffness: 300, damping: 20 } : { duration: 0.4 },
        x: vibrating ? { duration: 0.5, repeat: Infinity } : undefined,
        boxShadow: pulsing && !active ? { duration: 2.4, repeat: Infinity } : undefined
      }}
      whileHover={{ y: -4 }}
      title={gesture.note}
    >
      <span className="font-display text-sm" style={{ color: `var(--${accent}-text, var(--bone))` }}>
        {gesture.name}
      </span>
      <span className="font-mono text-[8px] tracking-wide-mono uppercase mt-1" style={{ color: 'var(--mute)' }}>
        {kindMark(kind)}
      </span>
      <span
        className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px]"
        style={{ background: 'var(--ink0)', border: '1px solid var(--line2)', color: 'var(--ash)' }}
      >
        {index + 1}
      </span>
    </motion.button>
  )
}
