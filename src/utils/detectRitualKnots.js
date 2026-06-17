// detectRitualKnots.js
// The knot engine. Knots are tensions in the weave: places where the ritual
// concentrates power, moves too fast, forgets to listen, or has no way back.
// The engine is deterministic so that the same composition always produces the
// same field of tensions, which the Knot Field renders as torsions and pulses
// rather than as a list of warnings.
//
// detectRitualKnots(roles, steps, safeguards, thresholds) returns an array of
// knot objects: { name, severity, reason, suggestion }.
// severity is one of 'Low', 'Medium', 'High'.

import { getGestureById, PAUSE_KINDS, TENSION_KINDS, DECISION_KINDS, ACTION_KINDS, RECOVERY_KINDS } from '../data/gestureLibrary.js'
import { getRoleById } from '../data/roleLibrary.js'

function kindsOf(steps) {
  return steps
    .map((s) => getGestureById(s.gestureId))
    .filter(Boolean)
    .map((g) => g.kind)
}

function joinedThresholdText(thresholds) {
  return (thresholds || []).join(' ').toLowerCase()
}

export function detectRitualKnots(roles = [], steps = [], safeguards = [], thresholds = []) {
  const knots = []
  const kinds = kindsOf(steps)
  const roleObjs = roles.map((r) => getRoleById(r)).filter(Boolean)
  const safeguardSet = new Set(safeguards)
  const thresholdText = joinedThresholdText(thresholds)

  const hasPause = kinds.some((k) => PAUSE_KINDS.has(k))
  const hasTension = kinds.some((k) => TENSION_KINDS.has(k))
  const hasDecision = kinds.some((k) => DECISION_KINDS.has(k))
  const hasAction = kinds.some((k) => ACTION_KINDS.has(k))
  const hasRecovery = kinds.some((k) => RECOVERY_KINDS.has(k))

  // 1. Too much speed without any pause.
  if (steps.length >= 4 && !hasPause) {
    knots.push({
      name: 'Speed without rest',
      severity: 'High',
      reason: 'The sequence moves through several stages with no pause, reflection or delay.',
      suggestion: 'Place a Pause or Reflect gesture before the decision lands.'
    })
  }

  // 2. A single voice holding too much control.
  if (roleObjs.length > 0) {
    const totalWeight = roleObjs.reduce((sum, r) => sum + r.weight, 0) || 1
    let dominant = null
    let dominantShare = 0
    for (const r of roleObjs) {
      const share = r.weight / totalWeight
      if (share > dominantShare) {
        dominantShare = share
        dominant = r
      }
    }
    if (dominant && dominantShare > 0.5 && roleObjs.length > 1) {
      knots.push({
        name: 'Concentrated voice',
        severity: dominantShare > 0.66 ? 'High' : 'Medium',
        reason: `${dominant.name} carries a majority of the ritual weight.`,
        suggestion: 'Add balancing roles or lower the weight of the dominant voice.'
      })
    }
  }

  // 3. Missing challenge path.
  const challengeReferenced =
    hasTension || safeguardSet.has('challenge-window') || thresholdText.includes('challenge')
  if (steps.length >= 4 && !challengeReferenced) {
    knots.push({
      name: 'No room for dissent',
      severity: 'Medium',
      reason: 'There is no challenge gesture, challenge window or threshold that names dissent.',
      suggestion: 'Add a Challenge gesture or a challenge window safeguard.'
    })
  }

  // 4. Witness concentration. A single witness becomes a single point of trust.
  if (safeguardSet.has('witness-requirement')) {
    const witnessCount = roleObjs.filter((r) => r.id === 'witness').length
    if (witnessCount <= 1) {
      knots.push({
        name: 'Witness concentration',
        severity: 'Medium',
        reason: 'A witness requirement rests on a single witness, a single point of trust.',
        suggestion: 'Invite a second witness or rotate the witness role between cycles.'
      })
    }
  } else if (
    (kinds.includes('act') || thresholdText.includes('treasury')) &&
    !roleObjs.some((r) => r.id === 'witness')
  ) {
    // Execution or treasury movement with no witness at all.
    knots.push({
      name: 'Unwitnessed action',
      severity: 'High',
      reason: 'An action is executed with no witness to confirm it happened.',
      suggestion: 'Add a Witness role and a witness requirement safeguard.'
    })
  }

  // 5. Excess complexity relative to the work.
  if (steps.length > 12 || roleObjs.length > 9) {
    knots.push({
      name: 'Overgrown weave',
      severity: 'Medium',
      reason: 'The ritual carries an unusually large number of stages or voices.',
      suggestion: 'Fold related stages together or remove roles that only observe.'
    })
  }

  // 6. Too many layers for a simple task.
  const maxLane = steps.reduce((m, s) => Math.max(m, s.lane || 0), 0)
  if (maxLane >= 3 && steps.length <= 6) {
    knots.push({
      name: 'Layered for little',
      severity: 'Low',
      reason: 'Several parallel layers are used for a short sequence.',
      suggestion: 'Flatten some layers into a single line of motion.'
    })
  }

  // 7. Execution too fast: an action with nothing slow before it.
  const firstActionIndex = kinds.findIndex((k) => ACTION_KINDS.has(k))
  if (firstActionIndex >= 0) {
    const before = kinds.slice(0, firstActionIndex)
    const hasSlowBefore = before.some((k) => PAUSE_KINDS.has(k) || k === 'examine' || DECISION_KINDS.has(k))
    if (!hasSlowBefore) {
      knots.push({
        name: 'Execution too fast',
        severity: 'High',
        reason: 'An action runs before any review, pause or decision.',
        suggestion: 'Place a Review, Pause or Consent gesture before Execute.'
      })
    }
  }

  // 8. Infinite review loop: many examine gestures and no decision to end them.
  const examineCount = kinds.filter((k) => k === 'examine').length
  if (examineCount >= 3 && !hasDecision) {
    knots.push({
      name: 'Endless review',
      severity: 'Medium',
      reason: 'Review repeats with no decision gesture to bring it to a close.',
      suggestion: 'Add a Consent gesture so review can resolve.'
    })
  }

  // 9. Missing recovery for fragile ritual kinds. This keys off explicit
  // emergency or cooldown signals rather than the presence of any pause, so a
  // healthy deliberate ritual with a single reflective pause is not flagged.
  const referencesEmergency =
    thresholdText.includes('cooldown') ||
    thresholdText.includes('emergency') ||
    kinds.some((k) => TENSION_KINDS.has(k))
  const recoveryProtected =
    hasRecovery || safeguardSet.has('recovery-path') || safeguardSet.has('reversible-step')
  if (referencesEmergency && hasAction && !recoveryProtected) {
    knots.push({
      name: 'No way back',
      severity: 'Medium',
      reason: 'The ritual can act under pressure but defines no recovery path.',
      suggestion: 'Add a Recover gesture or a recovery path safeguard.'
    })
  }

  // 10. Weak safeguards relative to the number of stages.
  if (steps.length >= 5 && safeguards.length === 0) {
    knots.push({
      name: 'Bare weave',
      severity: 'High',
      reason: 'A long ritual runs with no safeguards woven around it.',
      suggestion: 'Add at least one protective safeguard.'
    })
  }

  return knots
}
