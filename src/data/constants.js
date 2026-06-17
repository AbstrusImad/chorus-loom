// constants.js
// Shared vocabularies for ritual type and tone, used by the Seed Table and the
// scoring logic.

export const RITUAL_TYPES = [
  'Onboarding',
  'Proposal Flow',
  'Public Review',
  'Treasury Release',
  'Grant Round',
  'Emergency Pause',
  'Recovery',
  'Conflict Resolution',
  'Contributor Recognition',
  'Custom'
]

export const RITUAL_TONES = [
  { id: 'Calm', note: 'Unhurried and open.', accent: 'champagne' },
  { id: 'Deliberate', note: 'Measured, each step weighed.', accent: 'sage' },
  { id: 'Urgent', note: 'Fast, with little room to wait.', accent: 'crimson' },
  { id: 'Ceremonial', note: 'Formal and marked by ritual.', accent: 'champagne' },
  { id: 'Protective', note: 'Built to shield the vulnerable.', accent: 'ember' },
  { id: 'Experimental', note: 'Loose, willing to be wrong.', accent: 'sage' }
]

export const CHAMBERS = [
  { id: 'threshold', name: 'Threshold', measure: '00' },
  { id: 'seed', name: 'Seed Table', measure: '01' },
  { id: 'chorus', name: 'Role Chorus', measure: '02' },
  { id: 'loom', name: 'Loom Stage', measure: '03' },
  { id: 'knots', name: 'Knot Field', measure: '04' },
  { id: 'playback', name: 'Playback Hall', measure: '05' },
  { id: 'reliquary', name: 'Reliquary', measure: '06' },
  { id: 'settings', name: 'Settings', measure: '07' }
]
