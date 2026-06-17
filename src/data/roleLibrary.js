// roleLibrary.js
// The catalogue of civic actors available to a ritual. Each role is a voice in
// the chorus. The capacities describe what that voice can do inside the
// choreography: how loud it is (weight), whether it can be seen (visibility),
// whether it can act, block, wait or observe. These capacities feed the knot
// engine and the balance scoring.

export const ROLE_LIBRARY = [
  {
    id: 'proposer',
    name: 'Proposer',
    glyph: 'P',
    essence: 'Brings the first shape of an idea into the room.',
    weight: 0.6,
    visibility: 0.9,
    intervention: 0.8,
    block: 0.1,
    wait: 0.3,
    observation: 0.4,
    accent: 'sage'
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    glyph: 'R',
    essence: 'Reads carefully and asks what is missing.',
    weight: 0.55,
    visibility: 0.7,
    intervention: 0.6,
    block: 0.5,
    wait: 0.6,
    observation: 0.8,
    accent: 'champagne'
  },
  {
    id: 'guardian',
    name: 'Guardian',
    glyph: 'G',
    essence: 'Holds the safeguards and protects the slow parts.',
    weight: 0.7,
    visibility: 0.6,
    intervention: 0.5,
    block: 0.85,
    wait: 0.8,
    observation: 0.7,
    accent: 'ember'
  },
  {
    id: 'treasurer',
    name: 'Treasurer',
    glyph: 'T',
    essence: 'Carries the shared resources and their release.',
    weight: 0.75,
    visibility: 0.7,
    intervention: 0.7,
    block: 0.4,
    wait: 0.5,
    observation: 0.6,
    accent: 'sage'
  },
  {
    id: 'delegate',
    name: 'Delegate',
    glyph: 'D',
    essence: 'Speaks on behalf of others who trusted them.',
    weight: 0.65,
    visibility: 0.8,
    intervention: 0.7,
    block: 0.4,
    wait: 0.4,
    observation: 0.5,
    accent: 'champagne'
  },
  {
    id: 'builder',
    name: 'Builder',
    glyph: 'B',
    essence: 'Turns a decision into something real.',
    weight: 0.5,
    visibility: 0.6,
    intervention: 0.6,
    block: 0.2,
    wait: 0.3,
    observation: 0.4,
    accent: 'sage'
  },
  {
    id: 'observer',
    name: 'Observer',
    glyph: 'O',
    essence: 'Watches without acting, keeps a record in memory.',
    weight: 0.2,
    visibility: 0.5,
    intervention: 0.1,
    block: 0.05,
    wait: 0.9,
    observation: 0.95,
    accent: 'ember'
  },
  {
    id: 'community',
    name: 'Community',
    glyph: 'C',
    essence: 'The many. A chorus inside the chorus.',
    weight: 0.85,
    visibility: 0.95,
    intervention: 0.5,
    block: 0.6,
    wait: 0.7,
    observation: 0.8,
    accent: 'champagne'
  },
  {
    id: 'council',
    name: 'Council',
    glyph: 'K',
    essence: 'A small body trusted to weigh and decide.',
    weight: 0.8,
    visibility: 0.7,
    intervention: 0.75,
    block: 0.7,
    wait: 0.5,
    observation: 0.6,
    accent: 'sage'
  },
  {
    id: 'emergency-actor',
    name: 'Emergency Actor',
    glyph: 'E',
    essence: 'Allowed to move fast when the room is on fire.',
    weight: 0.9,
    visibility: 0.5,
    intervention: 0.95,
    block: 0.3,
    wait: 0.1,
    observation: 0.3,
    accent: 'crimson'
  },
  {
    id: 'witness',
    name: 'Witness',
    glyph: 'W',
    essence: 'Confirms that something truly happened.',
    weight: 0.4,
    visibility: 0.85,
    intervention: 0.2,
    block: 0.3,
    wait: 0.7,
    observation: 0.95,
    accent: 'champagne'
  },
  {
    id: 'challenger',
    name: 'Challenger',
    glyph: 'X',
    essence: 'Stands against the current to test its strength.',
    weight: 0.5,
    visibility: 0.8,
    intervention: 0.6,
    block: 0.75,
    wait: 0.4,
    observation: 0.6,
    accent: 'crimson'
  },
  {
    id: 'recipient',
    name: 'Recipient',
    glyph: 'Y',
    essence: 'Receives what the ritual decides to give.',
    weight: 0.3,
    visibility: 0.6,
    intervention: 0.2,
    block: 0.1,
    wait: 0.6,
    observation: 0.4,
    accent: 'sage'
  },
  {
    id: 'curator',
    name: 'Curator',
    glyph: 'U',
    essence: 'Shapes what is kept and what is set down.',
    weight: 0.45,
    visibility: 0.6,
    intervention: 0.5,
    block: 0.4,
    wait: 0.5,
    observation: 0.7,
    accent: 'ember'
  }
]

export function getRoleById(id) {
  return ROLE_LIBRARY.find((r) => r.id === id) || null
}
