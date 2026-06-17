// realGenLayer.js
// The live GenLayer plumbing for Chorus Loom on the Bradbury testnet. This file
// mirrors the verified genlayer-js reference: a read client, a wallet client
// that signs through the injected provider (MetaMask), resilient reads with
// backoff, transaction status naming, a leader peek that reads the in-flight
// artifact draft, and a poller that follows a tx until consensus decides.
//
// This module is pure plumbing. The public surface (createRitualRecord,
// analyzeRitualBalance, registerCivicScore, getGenLayerStatus, ...) lives in
// genlayerClient.js, which routes between this and the local mock.

import { createClient } from 'genlayer-js'
import { testnetBradbury } from 'genlayer-js/chains'
import { getGestureById, GESTURE_LIBRARY } from '../data/gestureLibrary.js'
import { getRoleById, ROLE_LIBRARY } from '../data/roleLibrary.js'

// ---- live contract coordinates ------------------------------------------
// The parent wires the real address and deploy tx after deployment, then
// rebuilds. Until then these are the zero placeholders.
export const CONTRACT_ADDRESS = '0x86e99d0D5A679e01795ABa2D3f23B9c393693F20'
export const DEPLOY_TX = '0x188dcdae5c6fd3bba395689bba0d80d96b20e8da1353351ea412563809c621a1'
export const EXPLORER = 'https://explorer-bradbury.genlayer.com'
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// Plain string compare. This is JavaScript, so there is no type concern with
// comparing the placeholder to the zero address.
export const IS_DEPLOYED =
  String(CONTRACT_ADDRESS).toLowerCase() !== ZERO_ADDRESS.toLowerCase()

const ADDRESS = CONTRACT_ADDRESS

// ---- clients -------------------------------------------------------------

export const readClient = createClient({ chain: testnetBradbury })

// When the account is a plain address and an injected provider is present,
// genlayer-js routes signing methods (eth_sendTransaction, signing) through the
// provider, so writeContract signs in MetaMask.
export function makeWalletClient(account) {
  const provider =
    typeof window !== 'undefined' ? window.ethereum : undefined
  return createClient({ chain: testnetBradbury, account, provider })
}

// ---- input limits mirrored from the contract ----------------------------

export const LIMITS = {
  name: { min: 1, max: 80 },
  type: { min: 1, max: 40 },
  tone: { min: 1, max: 40 },
  composition: { min: 2, max: 3000 }
}
export const MAX_LIST_ITEMS = 24
export const MAX_ITEM_CHARS = 60

// Closed sets shared with the contract.
export const POSTURES = ['Measured', 'Balanced', 'Resilient', 'Fragile', 'Rigid', 'Volatile']
export const SEVERITIES = ['Low', 'Medium', 'High']
const DEFAULT_POSTURE = 'Measured'
const DEFAULT_SEVERITY = 'Medium'

// ---- resilient reads -----------------------------------------------------

export async function withRpcRetry(fn, tries = 4) {
  let last
  for (let i = 0; i < tries; i += 1) {
    try {
      return await fn()
    } catch (e) {
      last = e
      if (!/rate limit|429|timeout|network|fetch|too many/i.test(String(e))) throw e
      // backoff: 2.5s, 5s, 10s, 20s
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i))
    }
  }
  throw last
}

// ---- normalization -------------------------------------------------------

function toRecord(value) {
  if (value instanceof Map) {
    const obj = {}
    for (const [k, v] of value.entries()) obj[String(k)] = normalize(v)
    return obj
  }
  return value
}

function normalize(value) {
  if (value instanceof Map) return toRecord(value)
  if (Array.isArray(value)) return value.map(normalize)
  if (typeof value === 'bigint') return value.toString()
  return value
}

function num(v) {
  if (typeof v === 'number') return v
  if (typeof v === 'bigint') return Number(v)
  const n = Number(String(v == null ? '0' : v))
  return Number.isFinite(n) ? n : 0
}

function str(v) {
  return String(v == null ? '' : v)
}

function clampScore(raw) {
  const n = Math.round(num(raw))
  if (n < 0) return 0
  if (n > 100) return 100
  return n
}

function coercePosture(raw) {
  const low = str(raw).trim().toLowerCase()
  for (const p of POSTURES) if (low === p.toLowerCase()) return p
  return DEFAULT_POSTURE
}

function coerceSeverity(raw) {
  const low = str(raw).trim().toLowerCase()
  for (const s of SEVERITIES) if (low === s.toLowerCase()) return s
  return DEFAULT_SEVERITY
}

function normalizeKnots(raw) {
  const out = []
  if (Array.isArray(raw)) {
    for (const item of raw.slice(0, 8)) {
      const r = toRecord(item)
      if (!r || typeof r !== 'object') continue
      out.push({
        name: str(r.name).slice(0, 80),
        severity: coerceSeverity(r.severity),
        reason: str(r.reason).slice(0, 200),
        suggestion: str(r.suggestion).slice(0, 200)
      })
    }
  }
  return out
}

function asStringList(raw) {
  const arr = Array.isArray(normalize(raw)) ? normalize(raw) : []
  return arr.map((x) => str(x)).filter((s) => s !== '')
}

// ---- composition building + capping --------------------------------------

// Reverse lookups so on-chain artifacts authored from human readable names can
// be rendered with the known glyph vocabulary when possible.
const GESTURE_BY_NAME = new Map(GESTURE_LIBRARY.map((g) => [g.name.toLowerCase(), g.id]))
const ROLE_BY_NAME = new Map(ROLE_LIBRARY.map((r) => [r.name.toLowerCase(), r.id]))

function cap(value, lo, hi) {
  const s = str(value).trim()
  if (s.length < lo) return s
  return s.slice(0, hi)
}

function capList(list) {
  const out = []
  if (Array.isArray(list)) {
    for (const item of list.slice(0, MAX_LIST_ITEMS)) {
      const s = str(item).trim().slice(0, MAX_ITEM_CHARS)
      if (s !== '') out.push(s)
    }
  }
  return out
}

// Turn a Chorus Loom ritual draft into the four readable string lists the
// contract expects. Roles and steps are sent as human readable names so the AI
// reads meaningful choreography; safeguards and thresholds are sent as-is.
export function ritualToLists(ritual) {
  const roles = (ritual.roles || []).map((id) => {
    const role = getRoleById(id)
    return role ? role.name : str(id)
  })
  const steps = (ritual.steps || []).map((s) => {
    const g = getGestureById(s && s.gestureId)
    return g ? g.name : str(s && s.gestureId ? s.gestureId : s)
  })
  const safeguards = (ritual.safeguards || []).map((s) => str(s))
  const thresholds = (ritual.thresholds || []).map((t) => str(t))
  return {
    roles: capList(roles),
    steps: capList(steps),
    safeguards: capList(safeguards),
    thresholds: capList(thresholds)
  }
}

export function buildComposition(ritual) {
  const lists = ritualToLists(ritual)
  return JSON.stringify(lists)
}

// Validate and cap the scalar inputs. Throws an expected style error when a
// field is out of range so the UI can surface it before signing.
export function capInputs(ritual) {
  const name = cap(ritual.name || 'Untitled Ritual', LIMITS.name.min, LIMITS.name.max)
  const type_ = cap(ritual.type || 'Custom', LIMITS.type.min, LIMITS.type.max)
  const tone = cap(ritual.tone || 'Deliberate', LIMITS.tone.min, LIMITS.tone.max)
  const composition = buildComposition(ritual)
  if (composition.length < LIMITS.composition.min || composition.length > LIMITS.composition.max) {
    throw new Error(
      `[EXPECTED] Composition must be ${LIMITS.composition.min}-${LIMITS.composition.max} characters`
    )
  }
  return { name, type_, tone, composition }
}

// ---- on-chain artifact normalization -------------------------------------

// Normalize a raw on-chain artifact record (Map or object) into a stable shape.
export function normalizeArtifact(raw) {
  const r = toRecord(raw) || {}
  return {
    id: str(r.id),
    name: str(r.name),
    type: str(r.type),
    tone: str(r.tone),
    roles: asStringList(r.roles),
    steps: asStringList(r.steps),
    safeguards: asStringList(r.safeguards),
    thresholds: asStringList(r.thresholds),
    posture: coercePosture(r.posture),
    clarityScore: clampScore(r.clarityScore),
    frictionScore: clampScore(r.frictionScore),
    balanceScore: clampScore(r.balanceScore),
    resilienceScore: clampScore(r.resilienceScore),
    knots: normalizeKnots(r.knots),
    civicScore: str(r.civicScore),
    compositionHash: str(r.compositionHash),
    author: str(r.author),
    created: num(r.created)
  }
}

// Map an on-chain step string back to a known gesture id when possible.
export function stepNameToGestureId(name) {
  const hit = GESTURE_BY_NAME.get(str(name).trim().toLowerCase())
  return hit || str(name)
}

export function roleNameToId(name) {
  const hit = ROLE_BY_NAME.get(str(name).trim().toLowerCase())
  return hit || str(name)
}

// ---- reads ---------------------------------------------------------------

export async function fetchArtifacts(start = 0) {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_artifacts', args: [start] })
  )
  const arr = normalize(raw) || []
  return (Array.isArray(arr) ? arr : []).map(normalizeArtifact)
}

export async function fetchArtifact(id) {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_artifact', args: [id] })
  )
  return normalizeArtifact(normalize(raw))
}

export async function fetchStats() {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_stats', args: [] })
  )
  const r = toRecord(normalize(raw)) || {}
  return {
    artifacts: num(r.artifacts),
    rituals: num(r.rituals),
    analyses: num(r.analyses)
  }
}

// ---- writes --------------------------------------------------------------

export function writeAnalyze(client, name, type_, tone, composition) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'analyze',
    args: [name, type_, tone, composition],
    value: 0n
  })
}

// register_ritual exists on-chain as a deterministic (non-AI) registration, but
// Chorus Loom keeps ritual creation local and instant. This helper is provided
// for completeness if a caller ever wants the on-chain record.
export function writeRegisterRitual(client, name, type_, tone, composition) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'register_ritual',
    args: [name, type_, tone, composition],
    value: 0n
  })
}

// ---- transaction polling -------------------------------------------------

const STATUS_NAME = {
  1: 'PENDING',
  2: 'PROPOSING',
  3: 'COMMITTING',
  4: 'REVEALING',
  5: 'ACCEPTED',
  6: 'UNDETERMINED',
  7: 'FINALIZED',
  8: 'CANCELED',
  12: 'VALIDATORS_TIMEOUT',
  13: 'LEADER_TIMEOUT'
}

export function statusName(s) {
  return STATUS_NAME[String(s)] || String(s == null ? 'PENDING' : s).toUpperCase()
}

// LEADER_TIMEOUT / VALIDATORS_TIMEOUT are intentionally absent: the network
// rotates the leader and retries, so keep polling through them.
export const TERMINAL = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED'])

function pick(obj, key) {
  if (obj instanceof Map) return obj.get(key)
  if (obj && typeof obj === 'object') return obj[key]
  return undefined
}

function decodeBase64(b64) {
  try {
    if (typeof atob === 'function') return atob(b64)
  } catch (e) {
    /* fall through */
  }
  try {
    // Node / SSR fallback. Browsers use atob above.
    return Buffer.from(b64, 'base64').toString('binary')
  } catch (e) {
    return ''
  }
}

// Peek at the leader's in-flight result. The contract's leader returns the FULL
// normalized artifact, and the raw prompt output is captured in the first
// equivalence output, so we scan it for the JSON object and return the draft
// posture, the four scores, the knots and the civic score sentence.
export function extractLeaderDraft(tx) {
  try {
    const receipts = pick(pick(tx, 'consensus_data'), 'leader_receipt')
    const first = Array.isArray(receipts) ? receipts[0] : receipts
    const b64 = pick(pick(first, 'eq_outputs'), '0')
    if (typeof b64 !== 'string' || b64.length === 0) return null
    const text = decodeBase64(b64)
    for (let i = text.length - 1; i >= 0; i -= 1) {
      if (text[i] !== '{') continue
      try {
        const obj = JSON.parse(text.slice(i))
        if (obj && typeof obj === 'object' && 'posture' in obj) {
          return {
            posture: coercePosture(obj.posture),
            clarityScore: clampScore(obj.clarityScore),
            frictionScore: clampScore(obj.frictionScore),
            balanceScore: clampScore(obj.balanceScore),
            resilienceScore: clampScore(obj.resilienceScore),
            knots: normalizeKnots(obj.knots),
            civicScore: str(obj.civicScore)
          }
        }
      } catch (e) {
        /* keep scanning toward the start for a parseable object */
      }
    }
    return null
  } catch (e) {
    return null
  }
}

export async function pollUntilDecided(client, hash, onUpdate) {
  let draft = null
  for (let i = 0; i < 150; i += 1) {
    const tx = await client.getTransaction({ hash }).catch(() => null)
    const status = statusName(tx ? tx.status : 'PENDING')
    draft = extractLeaderDraft(tx) || draft
    if (typeof onUpdate === 'function') onUpdate(status, draft)
    if (TERMINAL.has(status)) return { status, draft }
    await new Promise((r) => setTimeout(r, 8000))
  }
  return { status: 'TIMEOUT', draft }
}
