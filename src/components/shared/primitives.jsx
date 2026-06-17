// primitives.jsx
// Shared building blocks with personality. These are the quiet, reusable parts
// of the Chorus Loom surface: a layered loom surface, halo buttons, floating
// tags, tone chips, micro notes, soft sheets, drawers and toggles.

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export function LoomSurface({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`loom-surface ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function HaloButton({
  children,
  onClick,
  variant = 'ghost',
  accent = 'sage',
  className = '',
  disabled = false,
  type = 'button',
  title
}) {
  const accentVar = `var(--${accent})`
  const base =
    'relative font-mono text-[11px] tracking-loom uppercase px-4 py-2 rounded-full transition-all duration-500 ease-loom disabled:opacity-40 disabled:cursor-not-allowed'
  const styles =
    variant === 'solid'
      ? { background: accentVar, color: 'var(--ink0)', border: '1px solid transparent' }
      : variant === 'outline'
        ? { background: 'transparent', color: `var(--${accent}-text, var(--bone))`, border: '1px solid var(--line2)' }
        : { background: 'var(--ink3)', color: 'var(--bone2)', border: '1px solid var(--line1)' }
  return (
    <motion.button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1, boxShadow: `0 0 24px var(--${accent}-glow)` }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`${base} ${className}`}
      style={styles}
    >
      {children}
    </motion.button>
  )
}

export function FloatingTag({ children, accent = 'champagne', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-wide-mono uppercase px-2.5 py-1 rounded-full ${className}`}
      style={{
        color: `var(--${accent}-text, var(--bone2))`,
        background: 'var(--ink3)',
        border: '1px solid var(--line2)'
      }}
    >
      {children}
    </span>
  )
}

export function ToneChip({ label, note, active, onClick, accent = 'sage' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="text-left rounded-2xl px-4 py-3 transition-all duration-500 ease-loom"
      style={{
        background: active ? 'var(--ink4)' : 'var(--ink2)',
        border: active ? `1px solid var(--${accent})` : '1px solid var(--line1)',
        boxShadow: active ? `0 0 28px var(--${accent}-glow)` : 'none'
      }}
    >
      <div className="font-display text-sm" style={{ color: 'var(--bone)' }}>
        {label}
      </div>
      {note ? (
        <div className="font-body text-xs mt-0.5" style={{ color: 'var(--ash)' }}>
          {note}
        </div>
      ) : null}
    </motion.button>
  )
}

export function MicroNote({ children, className = '' }) {
  return (
    <p className={`font-mono text-[10px] tracking-wide-mono uppercase ${className}`} style={{ color: 'var(--mute)' }}>
      {children}
    </p>
  )
}

export function RibbonToggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex items-center gap-3"
      aria-pressed={on}
    >
      <span
        className="relative inline-flex h-5 w-10 rounded-full transition-colors duration-500 ease-loom"
        style={{ background: on ? 'var(--sage)' : 'var(--ink4)', border: '1px solid var(--line2)' }}
      >
        <motion.span
          className="absolute top-1/2 h-3.5 w-3.5 rounded-full"
          style={{ background: 'var(--ink0)', translateY: '-50%' }}
          animate={{ left: on ? '22px' : '3px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        />
      </span>
      {label ? (
        <span className="font-body text-sm" style={{ color: 'var(--bone2)' }}>
          {label}
        </span>
      ) : null}
    </button>
  )
}

// A sliding sheet that enters from the right, used for detail editors.
export function SoftSheet({ open, onClose, title, children, width = 420 }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-50 p-6 overflow-y-auto scroll-quiet"
            style={{ width, background: 'var(--ink1)', borderLeft: '1px solid var(--line2)' }}
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg" style={{ color: 'var(--bone)' }}>
                {title}
              </h3>
              <HaloButton onClick={onClose} accent="ember">
                Close
              </HaloButton>
            </div>
            {children}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

// A floating drawer rising from the bottom, used as a contextual tool tray.
export function FloatingDrawer({ open, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed left-1/2 bottom-6 z-30"
          style={{ x: '-50%' }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-full"
            style={{ background: 'var(--ink2)', border: '1px solid var(--line2)', boxShadow: 'var(--shadow-soft)' }}
          >
            {children}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

// A panel that drifts up into view with soft inertia.
export function DriftPanel({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
