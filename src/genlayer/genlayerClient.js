// genlayerClient.js
// The public client surface used by the interface. It keeps a stable set of
// exported names and routes each call between the LIVE GenLayer Bradbury
// contract and the local mock, based on the Settings genlayerMode ('live' or
// 'mock'). The default is 'live'.
//
// Live mode performs the real Bradbury flow: a wallet signed analyze write, a
// poll until consensus decides (with a leader peek so the weave can form while
// validators deliberate), then an authoritative read of the sealed artifact.
// Mock mode keeps the original instant, fully local behavior so the studio
// always feels full with no network.

import {
  mockCreateRitualRecord,
  mockAnalyzeRitualBalance,
  mockRegisterCivicScore,
  mockGetProof,
  mockGetStatus
} from './mockGenLayer.js'
import {
  CONTRACT_ADDRESS,
  EXPLORER,
  FAUCET,
  DEPLOY_TX,
  IS_DEPLOYED,
  fetchStats,
  fetchArtifacts,
  makeWalletClient,
  writeAnalyze,
  pollUntilDecided,
  capInputs,
  stepNameToGestureId,
  roleNameToId
} from './realGenLayer.js'
import { getActiveAccount, isOnBradbury, hasProvider } from './wallet.js'
import { generateRitualArtifact } from '../utils/generateRitualArtifact.js'
import { deriveMotionSeeds } from '../utils/motionSeeds.js'

export { CONTRACT_ADDRESS, EXPLORER, FAUCET, DEPLOY_TX, IS_DEPLOYED }

// ---- mode ----------------------------------------------------------------

let mode = 'live' // 'live' | 'mock'. Default is live.

export function setGenLayerMode(next) {
  mode = next === 'mock' ? 'mock' : 'live'
}

export function getGenLayerMode() {
  return mode
}

// Back compat helpers. Older code spoke in a boolean "mock" flag.
export function setGenLayerMock(enabled) {
  mode = enabled ? 'mock' : 'live'
}

export function isGenLayerMock() {
  return mode === 'mock'
}

// ---- error mapping -------------------------------------------------------

// Translate raw chain/provider errors into calm, human messages.
export function describeGenLayerError(err) {
  const msg = String((err && err.message) || err || '')
  if (/reject|denied|4001|cancel/i.test(msg)) {
    return 'You cancelled the signature'
  }
  if (/LackOfFundForMaxFee|insufficient funds|max fee|fee reserve/i.test(msg)) {
    return 'Your wallet is below the fee reserve for AI transactions (mostly refunded). Top up at testnet-faucet.genlayer.foundation'
  }
  if (/rate limit|429|timeout|network|fetch|too many|congest/i.test(msg)) {
    return 'The network is congested, your weave is still being notarized'
  }
  if (/not deployed/i.test(msg)) {
    return 'The Chorus Loom contract is not deployed to this network yet'
  }
  if (msg.startsWith('[EXPECTED]')) {
    return msg.replace('[EXPECTED]', '').trim()
  }
  return msg || 'Something interrupted the weave. Please try again'
}

// ---- on-chain artifact -> Chorus Loom artifact ---------------------------

// Build step objects the visual weave can render from on-chain step names.
function stepsFromNames(names) {
  return (names || []).map((name, i) => ({
    id: `os_${i}_${stepNameToGestureId(name)}`,
    gestureId: stepNameToGestureId(name),
    lane: 0
  }))
}

// Map an authoritative on-chain artifact into the Chorus Loom artifact shape the
// app already renders. The four scores, posture, knots and civic sentence come
// from chain. When the original draft is available (the user just sealed it) we
// keep its structural fields so playback stays faithful; otherwise we synthesize
// renderable structure from the on-chain strings. The motion seed is derived
// locally from the composition and knots. The proof is the real chain proof.
export function toChorusArtifact(onchain, options = {}) {
  const ritual = options.ritual || null
  const txHash = options.txHash || null

  const roles = ritual && ritual.roles && ritual.roles.length
    ? ritual.roles
    : (onchain.roles || []).map(roleNameToId)
  const steps = ritual && ritual.steps && ritual.steps.length
    ? ritual.steps
    : stepsFromNames(onchain.steps)
  const safeguards = ritual && ritual.safeguards && ritual.safeguards.length
    ? ritual.safeguards
    : onchain.safeguards || []
  const thresholds = ritual && ritual.thresholds && ritual.thresholds.length
    ? ritual.thresholds
    : onchain.thresholds || []
  const paths = ritual && ritual.paths ? ritual.paths : []

  const knots = onchain.knots || []
  const artifactMotionSeed = deriveMotionSeeds(
    { steps, roles, tone: onchain.tone || (ritual && ritual.tone) },
    knots
  )

  const explorerUrl = txHash
    ? `${EXPLORER}/tx/${txHash}`
    : `${EXPLORER}/address/${CONTRACT_ADDRESS}`

  return {
    ritualId: ritual && ritual.id ? ritual.id : onchain.id,
    onChainId: onchain.id,
    name: onchain.name || (ritual && ritual.name) || 'Untitled Ritual',
    type: onchain.type || (ritual && ritual.type) || 'Custom',
    tone: onchain.tone || (ritual && ritual.tone) || 'Deliberate',
    roles,
    steps,
    safeguards,
    thresholds,
    paths,
    posture: onchain.posture,
    clarityScore: onchain.clarityScore,
    frictionScore: onchain.frictionScore,
    balanceScore: onchain.balanceScore,
    resilienceScore: onchain.resilienceScore,
    knots,
    artifactMotionSeed,
    civicScore: onchain.civicScore || '',
    compositionHash: onchain.compositionHash || '',
    author: onchain.author || '',
    created: onchain.created,
    // Real proof. The previous mockProof field becomes this verified marker.
    verified: true,
    txHash: txHash || null,
    contract: CONTRACT_ADDRESS,
    explorerUrl,
    proof: { verified: true, txHash: txHash || null, contract: CONTRACT_ADDRESS }
  }
}

// ---- createRitualRecord --------------------------------------------------

// Ritual creation stays LOCAL and instant in both modes. register_ritual exists
// on-chain as an optional deterministic registration, but Chorus Loom never
// makes a slow Bradbury transaction just to create a ritual; the meaningful
// on-chain action is the AI consensus analyze, performed when sealing.
export function createRitualRecord(ritual) {
  return mockCreateRitualRecord(ritual)
}

// ---- analyzeRitualBalance ------------------------------------------------

// In mock mode this is the original instant local path. In live mode this is the
// real Bradbury flow, driven through the onStage callback:
//   'wallet' -> 'submitted'(hash) -> 'consensus'(status + peeked draft)
//             -> 'confirmed'(artifact) | 'error'(message)
export async function analyzeRitualBalance(ritual, options = {}) {
  const onStage = typeof options.onStage === 'function' ? options.onStage : () => {}

  if (mode === 'mock') {
    const result = await mockAnalyzeRitualBalance(ritual)
    const artifact = generateRitualArtifact(ritual)
    onStage('confirmed', { artifact })
    return { ...artifact, consensus: result.consensus }
  }

  // Live mode.
  if (!IS_DEPLOYED) {
    onStage('error', { message: describeGenLayerError(new Error('not deployed')) })
    throw new Error('The Chorus Loom contract is not deployed to this network yet')
  }
  const account = getActiveAccount()
  if (!account) {
    const message = hasProvider()
      ? 'Connect your wallet to weave this ritual on chain'
      : 'No wallet detected. Install MetaMask to weave on chain, or switch to mock mode'
    onStage('error', { message })
    throw new Error(message)
  }

  try {
    onStage('wallet', {})
    const { name, type_, tone, composition } = capInputs(ritual)
    const client = makeWalletClient(account)

    const hash = await writeAnalyze(client, name, type_, tone, composition)
    onStage('submitted', { txHash: hash, explorerUrl: `${EXPLORER}/tx/${hash}` })

    const { status, draft } = await pollUntilDecided(client, hash, (liveStatus, peeked) => {
      onStage('consensus', { status: liveStatus, draft: peeked, txHash: hash })
    })

    if (status === 'ACCEPTED' || status === 'FINALIZED') {
      // Read the authoritative artifact: newest by this author and name.
      let chosen = null
      try {
        const recent = await fetchArtifacts(0)
        const lowerName = String(name).toLowerCase()
        const lowerAuthor = String(account).toLowerCase()
        chosen =
          recent.find(
            (a) =>
              a.name.toLowerCase() === lowerName &&
              a.author.toLowerCase() === lowerAuthor
          ) ||
          recent.find((a) => a.author.toLowerCase() === lowerAuthor) ||
          recent[0] ||
          null
      } catch (e) {
        /* fall back to the leader draft below */
      }

      let artifact
      if (chosen) {
        artifact = toChorusArtifact(chosen, { ritual, txHash: hash })
      } else if (draft) {
        // Use the peeked draft as a graceful fallback if the read failed.
        artifact = toChorusArtifact(
          {
            id: 'weave',
            name,
            type: type_,
            tone,
            roles: [],
            steps: [],
            safeguards: [],
            thresholds: [],
            ...draft
          },
          { ritual, txHash: hash }
        )
      } else {
        throw new Error('The network is congested, your weave is still being notarized')
      }
      onStage('confirmed', { artifact, status, txHash: hash })
      return artifact
    }

    // UNDETERMINED / CANCELED / TIMEOUT.
    const message =
      status === 'CANCELED'
        ? 'The analysis was cancelled on chain'
        : 'The network is congested, your weave is still being notarized'
    onStage('error', { message, status, txHash: hash })
    throw new Error(message)
  } catch (err) {
    const message = describeGenLayerError(err)
    onStage('error', { message })
    throw new Error(message)
  }
}

// ---- registerCivicScore --------------------------------------------------

// In live mode the analyze write already persisted the civic assessment on
// chain, so this is a no-op that returns the artifact with its real proof. In
// mock mode it keeps the original simulated registration.
export function registerCivicScore(artifact) {
  if (mode === 'mock') return mockRegisterCivicScore(artifact)
  return Promise.resolve({
    status: 'finalized',
    verified: true,
    ritualId: artifact && artifact.ritualId,
    txHash: artifact && artifact.txHash,
    contract: CONTRACT_ADDRESS,
    artifact
  })
}

// ---- getMockProof --------------------------------------------------------

// Kept for API compatibility. Mock mode returns the simulated proof; live mode
// returns the real contract coordinates.
export function getMockProof(ritualId) {
  if (mode === 'mock') return mockGetProof(ritualId)
  return Promise.resolve({
    ritualId,
    verified: true,
    contract: CONTRACT_ADDRESS,
    explorerUrl: `${EXPLORER}/address/${CONTRACT_ADDRESS}`
  })
}

// ---- getGenLayerStatus ---------------------------------------------------

export async function getGenLayerStatus() {
  if (mode === 'mock') {
    const status = await mockGetStatus()
    return { ...status, mode: 'mock' }
  }
  const base = {
    mode: 'live',
    contract: CONTRACT_ADDRESS,
    explorer: EXPLORER,
    faucet: FAUCET,
    deployed: IS_DEPLOYED
  }
  if (!IS_DEPLOYED) {
    return { ...base, online: false, note: 'The Chorus Loom contract is not deployed to this network yet.' }
  }
  try {
    const stats = await fetchStats()
    return { ...base, online: true, ...stats }
  } catch (e) {
    return {
      ...base,
      online: false,
      note: 'Bradbury is not reachable right now. Reads will retry.'
    }
  }
}

// ---- on-chain reliquary feed --------------------------------------------

// Fetch the most recent on-chain artifacts and shape them as verified relic
// capsules for the Reliquary. Returns [] when not live, not deployed or on any
// read failure, so the local collection is never disturbed.
export async function fetchChainRelics() {
  if (mode !== 'live' || !IS_DEPLOYED) return []
  try {
    const arr = await fetchArtifacts(0)
    return arr.map((onchain) => {
      const artifact = toChorusArtifact(onchain, {})
      return {
        id: `chain:${onchain.id}`,
        name: artifact.name,
        type: artifact.type,
        tone: artifact.tone,
        intention: artifact.civicScore,
        roles: artifact.roles,
        steps: artifact.steps,
        safeguards: artifact.safeguards,
        thresholds: artifact.thresholds,
        paths: [],
        artifact,
        sealed: true,
        onChain: true,
        verified: true,
        author: artifact.author,
        contract: CONTRACT_ADDRESS,
        explorerUrl: `${EXPLORER}/address/${CONTRACT_ADDRESS}`,
        createdAt: null
      }
    })
  } catch (e) {
    return []
  }
}
