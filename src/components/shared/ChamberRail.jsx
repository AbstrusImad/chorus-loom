// ChamberRail.jsx
// A discreet vertical rail of measures, not a classic navbar. Each chamber is a
// numbered measure. The active measure glows. Moving between them feels like
// sliding along a score. Hidden on the Threshold.

import { motion } from 'framer-motion'
import { CHAMBERS } from '../../data/constants.js'

export default function ChamberRail({ active, onGo }) {
  const visible = CHAMBERS.filter((c) => c.id !== 'threshold')
  return (
    <div className="fixed left-0 top-0 bottom-0 z-30 flex items-center pointer-events-none">
      <div
        className="ml-3 md:ml-5 py-4 px-2 rounded-full flex flex-col gap-1 pointer-events-auto"
        style={{ background: 'var(--ink1)', border: '1px solid var(--line1)' }}
      >
        {visible.map((c) => {
          const isActive = c.id === active
          return (
            <button
              key={c.id}
              onClick={() => onGo(c.id)}
              className="group relative flex items-center"
              title={c.name}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full font-mono text-[10px] transition-all duration-500 ease-loom"
                style={{
                  background: isActive ? 'var(--ink4)' : 'transparent',
                  border: isActive ? '1px solid var(--sage)' : '1px solid transparent',
                  color: isActive ? 'var(--sage-text)' : 'var(--ash)',
                  boxShadow: isActive ? '0 0 20px var(--sage-glow)' : 'none'
                }}
              >
                {c.measure}
              </span>
              <span
                className="absolute left-12 whitespace-nowrap font-mono text-[10px] tracking-wide-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none px-2 py-1 rounded-md"
                style={{ background: 'var(--ink2)', border: '1px solid var(--line2)', color: 'var(--bone2)' }}
              >
                {c.name}
              </span>
              {isActive ? (
                <motion.span
                  layoutId="rail-active"
                  className="absolute -left-2 h-9 w-0.5 rounded-full"
                  style={{ background: 'var(--sage)' }}
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
