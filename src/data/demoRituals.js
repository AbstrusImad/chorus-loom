// demoRituals.js
// Seed rituals woven into the Reliquary on first run. Each ritual is a plain
// composition object that the artifact generator can turn into a living score.
// step shape: { id, gestureId, lane }  where lane is the vertical layer index.

let seq = 0
function step(gestureId, lane = 0) {
  seq += 1
  return { id: `s_${gestureId}_${seq}`, gestureId, lane }
}

export const DEMO_RITUALS = [
  {
    id: 'demo-treasury-release',
    name: 'Treasury Release Ceremony',
    type: 'Treasury Release',
    tone: 'Deliberate',
    intention: 'Release shared funds slowly, in the open, with an independent witness.',
    roles: ['treasurer', 'reviewer', 'witness', 'community'],
    steps: [
      step('announce', 0),
      step('review', 0),
      step('pause', 1),
      step('consent', 0),
      step('execute', 0),
      step('publish', 0)
    ],
    safeguards: ['min-review-window', 'witness-requirement', 'publication-after-execution'],
    thresholds: ['2 reviewers minimum', 'No unresolved challenge'],
    paths: []
  },
  {
    id: 'demo-proposal-reflection',
    name: 'Proposal Reflection Cycle',
    type: 'Proposal Flow',
    tone: 'Calm',
    intention: 'Give every proposal a true pause for reflection before any vote.',
    roles: ['proposer', 'reviewer', 'community', 'delegate', 'observer'],
    steps: [
      step('invite', 0),
      step('announce', 0),
      step('review', 0),
      step('reflect', 1),
      step('amend', 0),
      step('consent', 0),
      step('publish', 0),
      step('close', 0)
    ],
    safeguards: ['min-review-window', 'challenge-window', 'quorum-floor'],
    thresholds: ['Reflection window of 48 hours', 'Quorum of one third'],
    paths: []
  },
  {
    id: 'demo-emergency-pause',
    name: 'Emergency Pause with Cooldown',
    type: 'Emergency Pause',
    tone: 'Urgent',
    intention: 'Allow a fast protective stop, then force the system to slow down and review.',
    roles: ['emergency-actor', 'guardian', 'council', 'witness', 'community'],
    steps: [
      step('pause', 0),
      step('announce', 0),
      step('delay', 1),
      step('review', 0),
      step('consent', 0),
      step('recover', 0),
      step('publish', 0)
    ],
    safeguards: ['cooldown-after-emergency', 'witness-requirement', 'recovery-path', 'publication-after-execution'],
    thresholds: ['Cooldown of 24 hours', 'Council confirmation to resume'],
    paths: []
  },
  {
    id: 'demo-grant-round',
    name: 'Grant Round Weave',
    type: 'Grant Round',
    tone: 'Ceremonial',
    intention: 'Distribute grants through open review, witnessed selection and public receipts.',
    roles: ['curator', 'reviewer', 'council', 'recipient', 'witness', 'community'],
    steps: [
      step('invite', 0),
      step('announce', 0),
      step('review', 0),
      step('reflect', 1),
      step('consent', 0),
      step('reward', 0),
      step('publish', 0),
      step('close', 0)
    ],
    safeguards: ['min-review-window', 'witness-requirement', 'publication-after-execution', 'quorum-floor'],
    thresholds: ['Three reviewers per application', 'Published rubric'],
    paths: []
  },
  {
    id: 'demo-contributor-recognition',
    name: 'Contributor Recognition Rite',
    type: 'Contributor Recognition',
    tone: 'Ceremonial',
    intention: 'Honor sustained contribution with a visible, shared moment of recognition.',
    roles: ['curator', 'community', 'witness', 'recipient'],
    steps: [
      step('invite', 0),
      step('reflect', 1),
      step('announce', 0),
      step('reward', 0),
      step('publish', 0),
      step('close', 0)
    ],
    safeguards: ['publication-after-execution', 'rotation'],
    thresholds: ['Open nomination period', 'No self nomination'],
    paths: []
  }
]
