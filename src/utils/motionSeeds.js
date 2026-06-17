// motionSeeds.js
// Derives a small set of normalized motion parameters from a ritual. These
// seeds drive the procedural visuals: how dense the woven threads are, how fast
// the chorus orbits, how violently knots vibrate, how widely ribbons spread.
// Every value is clamped to 0..1 and deterministic.

import { getGestureById, TENSION_KINDS } from '../data/gestureLibrary.js'

function clamp01(n) {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(1, n))
}

const TONE_TEMPO = {
  Calm: 0.25,
  Deliberate: 0.4,
  Urgent: 0.92,
  Ceremonial: 0.5,
  Protective: 0.45,
  Experimental: 0.7
}

export function deriveMotionSeeds(ritual, knots = []) {
  const steps = ritual.steps || []
  const roles = ritual.roles || []

  const threadDensity = clamp01(0.18 + steps.length * 0.07 + roles.length * 0.04)

  const baseTempo = TONE_TEMPO[ritual.tone] != null ? TONE_TEMPO[ritual.tone] : 0.5
  const orbitTempo = clamp01(baseTempo * 0.8 + (roles.length / 14) * 0.4)

  const severityScore = knots.reduce((sum, k) => {
    if (k.severity === 'High') return sum + 0.34
    if (k.severity === 'Medium') return sum + 0.2
    return sum + 0.1
  }, 0)
  const knotIntensity = clamp01(severityScore)

  const maxLane = steps.reduce((m, s) => Math.max(m, s.lane || 0), 0)
  const tensionCount = steps
    .map((s) => getGestureById(s.gestureId))
    .filter(Boolean)
    .filter((g) => TENSION_KINDS.has(g.kind)).length
  const ribbonSpread = clamp01(0.2 + maxLane * 0.18 + tensionCount * 0.12)

  return { threadDensity, orbitTempo, knotIntensity, ribbonSpread }
}
