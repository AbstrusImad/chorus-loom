// Threshold.jsx
// The ceremonial entry. A dark, quiet space with suspended threads of light and
// a single gesture: Enter the Loom. No feature cards, no pricing, no preview.

import { motion } from 'framer-motion'
import { useApp } from '../store/AppStore.jsx'
import ThreadField from '../components/animations/ThreadField.jsx'
import { useMotionLevel } from '../components/animations/useMotionLevel.js'

export default function Threshold() {
  const { enter } = useApp()
  const motionLevel = useMotionLevel()

  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden" style={{ background: 'var(--ink0)' }}>
      <ThreadField density={0.8} tempo={0.3} hue="sage" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Suspended seal mark */}
      <motion.div
        className="absolute"
        style={{ width: 520, height: 520 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg width="520" height="520" viewBox="0 0 520 520" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={i}
              cx="260"
              cy="260"
              r={90 + i * 55}
              fill="none"
              stroke="var(--line2)"
              strokeWidth="1"
              animate={motionLevel > 0 ? { rotate: i % 2 === 0 ? 360 : -360 } : {}}
              transition={{ duration: 80 + i * 30, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '260px', originY: '260px' }}
              strokeDasharray={i % 2 === 0 ? '2 14' : '1 10'}
            />
          ))}
        </svg>
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span className="font-mono text-[11px] tracking-wide-mono uppercase" style={{ color: 'var(--champagne-text)' }}>
            Chorus Loom
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl md:text-6xl mt-6 leading-tight text-balance"
          style={{ color: 'var(--bone)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Design how a community moves.
        </motion.h1>

        <motion.p
          className="font-serif italic text-xl md:text-2xl mt-6"
          style={{ color: 'var(--bone2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
        >
          Governance is not only voting. It is choreography.
        </motion.p>

        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <motion.button
            type="button"
            onClick={enter}
            className="relative font-mono text-xs tracking-loom uppercase px-10 py-4 rounded-full"
            style={{ background: 'var(--sage)', color: 'var(--ink0)' }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 50px var(--sage-glow)' }}
            whileTap={{ scale: 0.97 }}
          >
            Enter the Loom
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: '1px solid var(--sage)' }}
              animate={motionLevel > 0 ? { opacity: [0.6, 0, 0.6], scale: [1, 1.25, 1] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.button>
        </motion.div>

        <motion.p
          className="font-mono text-[10px] tracking-wide-mono uppercase mt-10"
          style={{ color: 'var(--mute)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          A new interface for civic motion. Fully local. No accounts.
        </motion.p>
      </div>
    </div>
  )
}
