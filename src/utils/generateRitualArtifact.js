// generateRitualArtifact.js
// Turns a ritual composition into a Civic Score: a structured artifact carrying
// deterministic scores, the field of knots, motion seeds for the living weave,
// an expressive civic score sentence and a mock proof.
//
// generateRitualArtifact(input) where input is
//   { name, type, tone, roles, steps, safeguards, thresholds, paths }
// returns the artifact object described in the project brief.

import { getGestureById, PAUSE_KINDS, TENSION_KINDS, DECISION_KINDS, ACTION_KINDS } from '../data/gestureLibrary.js'
import { getRoleById } from '../data/roleLibrary.js'
import { detectRitualKnots } from './detectRitualKnots.js'
import { deriveMotionSeeds } from './motionSeeds.js'
import { clampScore } from './formatters.js'

function kindsOf(steps) {
  return steps
    .map((s) => getGestureById(s.gestureId))
    .filter(Boolean)
    .map((g) => g.kind)
}

function knotPenalty(knots, low, medium, high) {
  return knots.reduce((sum, k) => {
    if (k.severity === 'High') return sum + high
    if (k.severity === 'Medium') return sum + medium
    return sum + low
  }, 0)
}

// Deterministic small hash for the mock proof. Not cryptographic.
function pseudoHash(seedStr) {
  let h = 0x811c9dc5
  for (let i = 0; i < seedStr.length; i += 1) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, '0')
  return hex
}

function computeClarity(roles, steps, kinds, knots) {
  let clarity = 78
  const hasDecision = kinds.some((k) => DECISION_KINDS.has(k))
  const hasClose = kinds.includes('close') || kinds.includes('share')
  if (hasDecision) clarity += 6
  if (hasClose) clarity += 4
  clarity -= Math.max(0, roles.length - 6) * 4
  clarity -= Math.max(0, steps.length - 10) * 3
  clarity -= knotPenalty(knots, 4, 8, 16)
  return clampScore(clarity)
}

function computeFriction(kinds, safeguards, knots) {
  const pauses = kinds.filter((k) => PAUSE_KINDS.has(k)).length
  const tensions = kinds.filter((k) => TENSION_KINDS.has(k)).length
  const examine = kinds.filter((k) => k === 'examine').length
  const decide = kinds.filter((k) => DECISION_KINDS.has(k)).length
  let friction =
    pauses * 9 + tensions * 10 + examine * 6 + decide * 4 + safeguards.length * 5
  friction += knotPenalty(knots, 3, 8, 14)
  return clampScore(friction)
}

function computeBalance(roleObjs) {
  if (roleObjs.length === 0) return 0
  const total = roleObjs.reduce((s, r) => s + r.weight, 0) || 1
  const ideal = 1 / roleObjs.length
  let maxShare = 0
  let blockSpread = 0
  for (const r of roleObjs) {
    const share = r.weight / total
    if (share > maxShare) maxShare = share
    blockSpread += r.block
  }
  const concentration = Math.max(0, maxShare - ideal)
  // More roles able to block means power is more distributed.
  const blockBonus = Math.min(12, blockSpread * 4)
  const balance = 100 - concentration * 200 + blockBonus - (roleObjs.length < 2 ? 30 : 0)
  return clampScore(balance)
}

function computeResilience(roleObjs, kinds, safeguards, knots) {
  let resilience = 40
  resilience += safeguards.length * 8
  if (kinds.includes('recover')) resilience += 10
  if (roleObjs.some((r) => r.id === 'witness')) resilience += 6
  if (kinds.some((k) => PAUSE_KINDS.has(k))) resilience += 6
  resilience -= knotPenalty(knots, 2, 5, 14)
  return clampScore(resilience)
}

function buildCivicScore(input, scores, knots) {
  const { tone, type } = input
  const friction = scores.frictionScore
  const clarity = scores.clarityScore
  const resilience = scores.resilienceScore
  const tonePhrase = {
    Calm: 'moves without hurry',
    Deliberate: 'weighs each step before it moves',
    Urgent: 'moves quickly when it must',
    Ceremonial: 'moves with marked, formal motion',
    Protective: 'moves to shield those it carries',
    Experimental: 'moves while willing to be wrong'
  }[tone] || 'moves with intention'

  const frictionPhrase =
    friction >= 66 ? 'through strong friction' : friction >= 35 ? 'through measured friction' : 'with little resistance'
  const clarityPhrase = clarity >= 75 ? 'A clear weave' : clarity >= 55 ? 'A readable weave' : 'A tangled weave'
  const tail =
    knots.length === 0
      ? 'and holds no open tension.'
      : knots.length === 1
        ? 'and holds one open tension.'
        : `and holds ${knots.length} open tensions.`

  return `${clarityPhrase} for ${type.toLowerCase()} that ${tonePhrase} ${frictionPhrase}, carried by ${input.roles.length} voices, ${tail}`
}

export function generateRitualArtifact(input) {
  const safeName = input.name && input.name.trim() ? input.name.trim() : 'Untitled Ritual'
  const roles = input.roles || []
  const steps = input.steps || []
  const safeguards = input.safeguards || []
  const thresholds = input.thresholds || []
  const paths = input.paths || []

  const roleObjs = roles.map((r) => getRoleById(r)).filter(Boolean)
  const kinds = kindsOf(steps)

  const knots = detectRitualKnots(roles, steps, safeguards, thresholds)

  const clarityScore = computeClarity(roles, steps, kinds, knots)
  const frictionScore = computeFriction(kinds, safeguards, knots)
  const balanceScore = computeBalance(roleObjs)
  const resilienceScore = computeResilience(roleObjs, kinds, safeguards, knots)

  const ritualId =
    input.id ||
    `rit_${pseudoHash(safeName + steps.length + roles.length + Date.now()).toLowerCase()}`

  const artifactMotionSeed = deriveMotionSeeds({ ...input, name: safeName }, knots)

  const civicScore = buildCivicScore(
    { ...input, name: safeName, roles },
    { clarityScore, frictionScore, resilienceScore },
    knots
  )

  const proofSeed = `${safeName}|${roles.join(',')}|${steps.map((s) => s.gestureId).join(',')}`
  const mockProof = `0xCHORUS_FAKE_HASH_${pseudoHash(proofSeed)}`

  return {
    ritualId,
    name: safeName,
    type: input.type || 'Custom',
    tone: input.tone || 'Deliberate',
    roles,
    steps,
    safeguards,
    thresholds,
    paths,
    clarityScore,
    frictionScore,
    balanceScore,
    resilienceScore,
    knots,
    artifactMotionSeed,
    civicScore,
    mockProof
  }
}
