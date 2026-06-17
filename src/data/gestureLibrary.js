// gestureLibrary.js
// Gestures are the moves a community makes during a ritual. Each gesture is a
// glyph placed on the Loom Stage and stitched to the next with a thread.
// kind classifies the gesture so the playback and knot engine can reason about
// pacing, decision points and safeguards.
//
// kind values:
//   open      a beginning or invitation
//   inform    a broadcast of information
//   pause     a deliberate stop, reflection or cooldown
//   examine   reading, reviewing, weighing
//   tension   challenge, escalation, dissent
//   adjust    amendment or correction
//   decide    a moment of consent or decision
//   wait      a delay, time gate
//   act       execution, the irreversible move
//   share     publication, distribution
//   give      reward or recognition
//   close     ending, sealing
//   recover   recovery, reopening after failure

export const GESTURE_LIBRARY = [
  { id: 'invite', name: 'Invite', kind: 'open', accent: 'sage', note: 'Open the circle and call the voices in.' },
  { id: 'announce', name: 'Announce', kind: 'inform', accent: 'champagne', note: 'Make the intention visible to all.' },
  { id: 'pause', name: 'Pause', kind: 'pause', accent: 'ember', note: 'Hold still. Let the room breathe.' },
  { id: 'reflect', name: 'Reflect', kind: 'pause', accent: 'ember', note: 'Turn inward before moving on.' },
  { id: 'review', name: 'Review', kind: 'examine', accent: 'champagne', note: 'Read closely and ask what is missing.' },
  { id: 'challenge', name: 'Challenge', kind: 'tension', accent: 'crimson', note: 'Stand against the current to test it.' },
  { id: 'escalate', name: 'Escalate', kind: 'tension', accent: 'crimson', note: 'Raise the matter to a wider body.' },
  { id: 'amend', name: 'Amend', kind: 'adjust', accent: 'sage', note: 'Reshape the proposal in response.' },
  { id: 'consent', name: 'Consent', kind: 'decide', accent: 'sage', note: 'The room agrees to move forward.' },
  { id: 'delay', name: 'Delay', kind: 'wait', accent: 'ember', note: 'A gate of time before the next move.' },
  { id: 'execute', name: 'Execute', kind: 'act', accent: 'sage', note: 'Turn the decision into an action.' },
  { id: 'publish', name: 'Publish', kind: 'share', accent: 'champagne', note: 'Record the result in the open.' },
  { id: 'reward', name: 'Reward', kind: 'give', accent: 'champagne', note: 'Recognize and distribute.' },
  { id: 'close', name: 'Close', kind: 'close', accent: 'ember', note: 'Seal the ritual and rest.' },
  { id: 'recover', name: 'Recover', kind: 'recover', accent: 'sage', note: 'Reopen a path when something failed.' },
  { id: 'reopen', name: 'Reopen', kind: 'recover', accent: 'sage', note: 'Return to an earlier stage with care.' }
]

export function getGestureById(id) {
  return GESTURE_LIBRARY.find((g) => g.id === id) || null
}

// Kinds used by various visual treatments.
export const PAUSE_KINDS = new Set(['pause', 'wait'])
export const DECISION_KINDS = new Set(['decide'])
export const TENSION_KINDS = new Set(['tension'])
export const ACTION_KINDS = new Set(['act'])
export const RECOVERY_KINDS = new Set(['recover'])
