// mockGenLayer.js
// A fully local simulation of a GenLayer Intelligent Contract. Nothing here
// touches the network. It mimics the shape of an asynchronous on chain call:
// a small artificial latency, a deterministic fake transaction hash, and a
// status object. It exists so the interface can show how a ritual would be
// recorded and how validator consensus would agree on its balance and knots.

import { generateRitualArtifact } from '../utils/generateRitualArtifact.js'
import { detectRitualKnots } from '../utils/detectRitualKnots.js'

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Deterministic fake hash from a string. Not cryptographic.
function fakeHash(input) {
  let h = 0x811c9dc5
  const s = String(input)
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  const a = (h >>> 0).toString(16)
  const b = (Math.imul(h ^ 0x9e3779b9, 0x85ebca6b) >>> 0).toString(16)
  return `0x${(a + b).padEnd(40, '0').slice(0, 40)}`
}

// In memory ledger of mock records for the session.
const ledger = new Map()

export async function mockCreateRitualRecord(ritual) {
  await delay(420)
  const txHash = fakeHash('create:' + ritual.id + ritual.name)
  const record = {
    txHash,
    ritualId: ritual.id,
    recordedAt: new Date().toISOString(),
    status: 'finalized'
  }
  ledger.set(ritual.id, record)
  return record
}

export async function mockAnalyzeRitualBalance(ritual) {
  await delay(520)
  const knots = detectRitualKnots(ritual.roles, ritual.steps, ritual.safeguards, ritual.thresholds)
  const artifact = generateRitualArtifact(ritual)
  // A simulated validator panel that "agrees" on the categorical reading.
  return {
    balanceScore: artifact.balanceScore,
    clarityScore: artifact.clarityScore,
    frictionScore: artifact.frictionScore,
    resilienceScore: artifact.resilienceScore,
    knotCount: knots.length,
    consensus: {
      validators: 5,
      agreed: 5,
      tolerance: 4,
      note: 'Five mock validators agreed on the categorical balance within numeric tolerance.'
    }
  }
}

export async function mockRegisterCivicScore(artifact) {
  await delay(480)
  const txHash = fakeHash('score:' + artifact.ritualId + artifact.civicScore)
  return {
    txHash,
    ritualId: artifact.ritualId,
    civicScore: artifact.civicScore,
    registeredAt: new Date().toISOString(),
    status: 'finalized'
  }
}

export async function mockGetProof(ritualId) {
  await delay(200)
  const existing = ledger.get(ritualId)
  return {
    ritualId,
    proof: fakeHash('proof:' + ritualId),
    finalized: Boolean(existing),
    blockHint: 'mock-block-' + (Math.abs(hashInt(ritualId)) % 90000 + 10000)
  }
}

function hashInt(s) {
  let h = 0
  for (let i = 0; i < String(s).length; i += 1) {
    h = (Math.imul(31, h) + String(s).charCodeAt(i)) | 0
  }
  return h
}

export async function mockGetStatus() {
  await delay(120)
  return {
    network: 'genlayer-localnet-mock',
    online: true,
    chainId: 'mock-61999',
    height: 100000 + (Date.now() % 50000),
    note: 'Simulated status. No network connection is made.'
  }
}
