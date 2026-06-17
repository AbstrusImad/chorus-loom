// safeguardsLibrary.js
// Safeguards are the protective conditions woven around a ritual. They are not
// gestures; they are halos placed over the choreography that the knot engine
// reads when judging resilience and friction.

export const SAFEGUARDS_LIBRARY = [
  { id: 'min-review-window', name: 'Minimum review window', note: 'A floor of time before a decision can land.', protects: ['speed'] },
  { id: 'witness-requirement', name: 'Witness requirement', note: 'An independent voice must confirm.', protects: ['execution', 'treasury'] },
  { id: 'publication-after-execution', name: 'Publication after execution', note: 'Every action becomes part of the open record.', protects: ['transparency'] },
  { id: 'cooldown-after-emergency', name: 'Cooldown after emergency', note: 'A forced rest after a fast move.', protects: ['emergency', 'recovery'] },
  { id: 'quorum-floor', name: 'Quorum floor', note: 'A minimum number of voices must be present.', protects: ['legitimacy'] },
  { id: 'challenge-window', name: 'Challenge window', note: 'A space where dissent can be raised.', protects: ['challenge'] },
  { id: 'dual-control', name: 'Dual control', note: 'Two roles must act together.', protects: ['execution', 'power'] },
  { id: 'reversible-step', name: 'Reversible step', note: 'A move that can be undone before sealing.', protects: ['recovery'] },
  { id: 'recovery-path', name: 'Recovery path', note: 'A defined way back when something fails.', protects: ['recovery'] },
  { id: 'rotation', name: 'Role rotation', note: 'Power does not stay in one place.', protects: ['power'] }
]

export function getSafeguardById(id) {
  return SAFEGUARDS_LIBRARY.find((s) => s.id === id) || null
}
