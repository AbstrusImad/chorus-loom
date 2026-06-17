// RitualWeave.jsx
// A reusable SVG rendering of a ritual as a woven path of nodes and ribbons.
// Used full size on the Loom Stage and Playback Hall, and small as a living
// thumbnail inside relic capsules and the civic score plate. Threads are
// MotionRibbons; nodes are WeaveNodes. The active index highlights the playback
// position.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getGestureById, PAUSE_KINDS, TENSION_KINDS, DECISION_KINDS, ACTION_KINDS } from '../../data/gestureLibrary.js'

function layout(steps, width, height, padding) {
  const n = steps.length
  if (n === 0) return []
  const laneCount = steps.reduce((m, s) => Math.max(m, (s.lane || 0) + 1), 1)
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  return steps.map((s, i) => {
    const x = padding + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
    const laneT = laneCount === 1 ? 0.5 : (s.lane || 0) / (laneCount - 1)
    // Weave the path with a gentle vertical sine so it never reads as a flat line.
    const wave = Math.sin(i * 0.9) * innerH * 0.08
    const y = padding + laneT * innerH * 0.6 + innerH * 0.2 + wave
    return { ...s, x, y, index: i }
  })
}

function accentForKind(kind) {
  if (TENSION_KINDS.has(kind)) return 'crimson'
  if (PAUSE_KINDS.has(kind)) return 'ember'
  if (DECISION_KINDS.has(kind)) return 'sage'
  if (ACTION_KINDS.has(kind)) return 'sage'
  return 'champagne'
}

export default function RitualWeave({
  steps = [],
  width = 760,
  height = 320,
  activeIndex = -1,
  highlightKinds = null,
  compact = false,
  motionLevel = 0.85,
  onNodeClick
}) {
  const padding = compact ? 18 : 48
  const nodes = useMemo(
    () => layout(steps, width, height, padding).map((node) => {
      const g = getGestureById(node.gestureId)
      return { ...node, gesture: g, accent: g ? accentForKind(g.kind) : 'champagne' }
    }),
    [steps, width, height, padding]
  )

  const r = compact ? 5 : 13

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="threadGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--sage)" stopOpacity="0.1" />
          <stop offset="50%" stopColor="var(--champagne)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--sage)" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Ribbons connecting consecutive nodes. */}
      {nodes.map((node, i) => {
        if (i === 0) return null
        const prev = nodes[i - 1]
        const midX = (prev.x + node.x) / 2
        const path = `M ${prev.x} ${prev.y} C ${midX} ${prev.y}, ${midX} ${node.y}, ${node.x} ${node.y}`
        const reached = activeIndex >= i
        return (
          <g key={`thread-${node.id}`}>
            <path d={path} fill="none" stroke="var(--line2)" strokeWidth={compact ? 1 : 2} />
            <motion.path
              d={path}
              fill="none"
              stroke="url(#threadGrad)"
              strokeWidth={compact ? 1.5 : 3}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: reached ? 1 : 0.45 }}
              transition={{ duration: motionLevel > 0 ? 1.1 : 0, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            />
          </g>
        )
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const dimmed = highlightKinds && node.gesture && !highlightKinds.has(node.gesture.kind)
        const isActive = node.index === activeIndex
        return (
          <g
            key={node.id}
            transform={`translate(${node.x} ${node.y})`}
            style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            onClick={onNodeClick ? () => onNodeClick(node.index) : undefined}
          >
            {isActive ? (
              <motion.circle
                r={r + 10}
                fill="none"
                stroke={`var(--${node.accent})`}
                strokeWidth="1.5"
                initial={{ opacity: 0.7, scale: 0.7 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
            ) : null}
            <motion.circle
              r={r}
              fill="var(--ink2)"
              stroke={`var(--${node.accent})`}
              strokeWidth={isActive ? 2.5 : 1.5}
              opacity={dimmed ? 0.25 : 1}
              animate={
                motionLevel > 0 && !compact
                  ? { r: isActive ? [r, r + 2, r] : r }
                  : {}
              }
              transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
            />
            {!compact && node.gesture ? (
              <text
                y={r + 18}
                textAnchor="middle"
                fontSize="11"
                fontFamily="IBM Plex Mono, monospace"
                fill={dimmed ? 'var(--mute)' : 'var(--bone2)'}
              >
                {node.gesture.name}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
