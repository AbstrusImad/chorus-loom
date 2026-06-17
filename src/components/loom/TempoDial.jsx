// TempoDial.jsx
// A circular dial for an abstract 0..1 measure such as tempo or complexity. The
// arc fills with the accent and a small needle rotates. Read only by default;
// pass onChange to make it interactive.

import { motion } from 'framer-motion'

export default function TempoDial({ value = 0.5, label, accent = 'sage', size = 96 }) {
  const v = Math.max(0, Math.min(1, value))
  const radius = size / 2 - 8
  const circ = 2 * Math.PI * radius
  const dash = circ * (0.75 * v)
  const cx = size / 2
  const cy = size / 2
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--line2)"
          strokeWidth="3"
          strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`var(--${accent})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(135 ${cx} ${cy})`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px var(--${accent}-glow))` }}
        />
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fontSize="18"
          fontFamily="Syne, sans-serif"
          fontWeight="700"
          fill="var(--bone)"
        >
          {Math.round(v * 100)}
        </text>
      </svg>
      {label ? (
        <span className="font-mono text-[9px] tracking-wide-mono uppercase" style={{ color: 'var(--ash)' }}>
          {label}
        </span>
      ) : null}
    </div>
  )
}
