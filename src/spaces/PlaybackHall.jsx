// PlaybackHall.jsx
// The ritual plays back as an abstract choreography. Stages activate in
// sequence, roles enter the chorus, pauses hold, decisions surface. Controls let
// the viewer slow down, speed up, isolate decision points or safeguards, and
// highlight a single role.
//
// Sealing the ritual produces the Civic Score. In mock mode this is instant and
// local. In live mode it is the real GenLayer Bradbury flow: confirm in wallet,
// submitted (tx hash + explorer link), consensus deliberating (live status and a
// peeked leader draft rendered as the weave forming), then the authoritative
// Civic Score, or a friendly error with retry. The other chambers never block.

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../store/AppStore.jsx'
import RitualWeave from '../components/loom/RitualWeave.jsx'
import TempoDial from '../components/loom/TempoDial.jsx'
import CivicScorePlate from '../components/shared/CivicScorePlate.jsx'
import RoleOrb from '../components/chorus/RoleOrb.jsx'
import { HaloButton, MicroNote, DriftPanel, FloatingTag, SoftSheet } from '../components/shared/primitives.jsx'
import { getGestureById, DECISION_KINDS, PAUSE_KINDS } from '../data/gestureLibrary.js'
import { getRoleById } from '../data/roleLibrary.js'
import { generateRitualArtifact } from '../utils/generateRitualArtifact.js'
import {
  analyzeRitualBalance,
  registerCivicScore,
  getGenLayerMode,
  describeGenLayerError,
  EXPLORER,
  FAUCET
} from '../genlayer/genlayerClient.js'
import { useWallet } from '../genlayer/wallet.js'
import { useMotionLevel } from '../components/animations/useMotionLevel.js'

// A calm word for each on-chain transaction status.
const STATUS_COPY = {
  PENDING: 'Reaching the validators',
  PROPOSING: 'The leader is reading the ritual',
  COMMITTING: 'Validators are committing',
  REVEALING: 'Validators are revealing',
  LEADER_TIMEOUT: 'Rotating to a fresh leader',
  VALIDATORS_TIMEOUT: 'Waiting on the validator set',
  ACCEPTED: 'Consensus reached',
  FINALIZED: 'Finalized on chain'
}

export default function PlaybackHall() {
  const { state, go, sealRitual, saveSealedArtifact } = useApp()
  const draft = state.draft
  const motionLevel = useMotionLevel()
  const wallet = useWallet()
  const steps = draft.steps

  const [active, setActive] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [filter, setFilter] = useState('all')
  const [roleHighlight, setRoleHighlight] = useState(null)
  const [sealOpen, setSealOpen] = useState(false)
  const [artifact, setArtifact] = useState(null)

  // Live consensus lifecycle.
  const [stage, setStage] = useState('idle') // idle|wallet|submitted|consensus|confirmed|error
  const [txHash, setTxHash] = useState(null)
  const [liveStatus, setLiveStatus] = useState(null)
  const [peeked, setPeeked] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const timerRef = useRef(null)

  const liveArtifact = useMemo(() => generateRitualArtifact(draft), [draft])

  useEffect(() => {
    if (!playing) return undefined
    const tempo = liveArtifact.artifactMotionSeed.orbitTempo
    const base = 1500 - tempo * 700
    const interval = Math.max(380, base / speed)
    timerRef.current = setTimeout(() => {
      setActive((a) => {
        if (a + 1 >= steps.length) {
          setPlaying(false)
          return steps.length - 1
        }
        return a + 1
      })
    }, interval)
    return () => clearTimeout(timerRef.current)
  }, [playing, active, speed, steps.length, liveArtifact])

  function play() {
    if (active >= steps.length - 1) setActive(-1)
    setPlaying(true)
  }

  const highlightKinds =
    filter === 'decisions' ? DECISION_KINDS : filter === 'safeguards' ? PAUSE_KINDS : null

  const activeGesture = active >= 0 && steps[active] ? getGestureById(steps[active].gestureId) : null
  const roleEntryThreshold = steps.length > 0 ? (active + 1) / steps.length : 0

  function onStage(name, info) {
    if (name === 'wallet') {
      setStage('wallet')
    } else if (name === 'submitted') {
      setStage('submitted')
      setTxHash(info.txHash)
    } else if (name === 'consensus') {
      setStage('consensus')
      setLiveStatus(info.status)
      if (info.draft) setPeeked(info.draft)
      if (info.txHash) setTxHash(info.txHash)
    } else if (name === 'confirmed') {
      setStage('confirmed')
      if (info.artifact) setArtifact(info.artifact)
    } else if (name === 'error') {
      setStage('error')
      setErrorMsg(info.message)
    }
  }

  async function runLiveSeal() {
    setStage('wallet')
    setErrorMsg(null)
    setTxHash(null)
    setPeeked(null)
    setArtifact(null)
    try {
      const art = await analyzeRitualBalance(draft, { onStage })
      saveSealedArtifact(art)
      setArtifact(art)
      setStage('confirmed')
    } catch (err) {
      setStage('error')
      setErrorMsg(describeGenLayerError(err))
    }
  }

  function seal() {
    setSealOpen(true)
    if (getGenLayerMode() === 'mock') {
      const art = sealRitual()
      setArtifact(art)
      setStage('confirmed')
      // Keep the simulated registration for the in-session feel. Local only.
      registerCivicScore(art).catch(() => {})
      return
    }
    runLiveSeal()
  }

  const isMock = getGenLayerMode() === 'mock'
  const needsWallet = !isMock && !wallet.address
  const inFlight = stage === 'wallet' || stage === 'submitted' || stage === 'consensus'

  return (
    <div className="h-full w-full overflow-y-auto scroll-quiet px-6 md:px-10 py-8">
      <div className="max-w-6xl mx-auto">
        <DriftPanel>
          <MicroNote>Playback Hall</MicroNote>
          <h2 className="font-display text-4xl mt-2" style={{ color: 'var(--bone)' }}>
            Watch the community move.
          </h2>
          <p className="font-serif italic text-lg mt-3" style={{ color: 'var(--bone2)' }}>
            {liveArtifact.civicScore}
          </p>
        </DriftPanel>

        {/* Stage */}
        <div
          className="rounded-3xl mt-6 overflow-hidden relative"
          style={{ background: 'var(--ink1)', border: '1px solid var(--line2)', height: 320 }}
        >
          <RitualWeave
            steps={steps}
            width={900}
            height={320}
            activeIndex={active}
            highlightKinds={highlightKinds}
            motionLevel={motionLevel}
            onNodeClick={(i) => {
              setActive(i)
              setPlaying(false)
            }}
          />
          <AnimatePresence>
            {activeGesture ? (
              <motion.div
                key={activeGesture.id + active}
                className="absolute bottom-4 left-1/2"
                style={{ transform: 'translateX(-50%)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div
                  className="px-4 py-2 rounded-full text-center"
                  style={{ background: 'var(--ink0)', border: '1px solid var(--line2)' }}
                >
                  <span className="font-display text-sm" style={{ color: `var(--${activeGesture.accent}-text, var(--bone))` }}>
                    {activeGesture.name}
                  </span>
                  <span className="font-body text-xs ml-2" style={{ color: 'var(--ash)' }}>
                    {activeGesture.note}
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Chorus entering */}
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          {draft.roles.map((id, i) => {
            const role = getRoleById(id)
            if (!role) return null
            const entered = i / Math.max(1, draft.roles.length) <= roleEntryThreshold || active < 0
            return (
              <motion.div
                key={id}
                animate={{ opacity: entered ? 1 : 0.25, scale: entered ? 1 : 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <RoleOrb
                  role={role}
                  size={58}
                  selected={roleHighlight === id}
                  dimmed={roleHighlight && roleHighlight !== id}
                  onClick={() => setRoleHighlight(roleHighlight === id ? null : id)}
                  floatSeed={i % 4}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Controls */}
        <div
          className="rounded-2xl mt-6 p-4 flex items-center gap-3 flex-wrap"
          style={{ background: 'var(--ink2)', border: '1px solid var(--line2)' }}
        >
          {playing ? (
            <HaloButton onClick={() => setPlaying(false)} accent="ember">Pause</HaloButton>
          ) : (
            <HaloButton onClick={play} variant="solid" accent="sage">Play</HaloButton>
          )}
          <HaloButton onClick={() => { setActive(-1); setPlaying(false) }} accent="ember">Reset</HaloButton>
          <div className="flex items-center gap-2 ml-2">
            <MicroNote>Tempo</MicroNote>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="font-mono text-[10px] px-2.5 py-1 rounded-full"
                style={{
                  background: speed === s ? 'var(--ink4)' : 'transparent',
                  border: '1px solid var(--line2)',
                  color: speed === s ? 'var(--bone)' : 'var(--ash)'
                }}
              >
                {s === 0.5 ? 'slow' : s === 1 ? 'even' : 'fast'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <MicroNote>Reveal</MicroNote>
            {[
              ['all', 'all'],
              ['decisions', 'decisions'],
              ['safeguards', 'pauses']
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="font-mono text-[10px] px-2.5 py-1 rounded-full"
                style={{
                  background: filter === id ? 'var(--ink4)' : 'transparent',
                  border: '1px solid var(--line2)',
                  color: filter === id ? 'var(--bone)' : 'var(--ash)'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <HaloButton onClick={() => go('knots')} accent="ember">
            Back to tensions
          </HaloButton>
          <HaloButton onClick={seal} variant="solid" accent="champagne">
            {isMock ? 'Seal the Civic Score' : 'Weave on GenLayer'}
          </HaloButton>
        </div>
      </div>

      <SoftSheet
        open={sealOpen}
        onClose={() => {
          if (inFlight) return
          setSealOpen(false)
        }}
        title={stage === 'confirmed' ? 'The ritual is sealed' : 'Weaving the Civic Score'}
        width={580}
      >
        {stage === 'confirmed' && artifact ? (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <FloatingTag accent="sage">sealed to reliquary</FloatingTag>
              {artifact.verified ? (
                <FloatingTag accent="champagne">verified on genlayer</FloatingTag>
              ) : (
                <FloatingTag accent="champagne">local civic score</FloatingTag>
              )}
            </div>
            <CivicScorePlate artifact={artifact} ritual={draft} motionLevel={motionLevel} />
            <div className="flex items-center justify-between mt-5">
              <HaloButton onClick={() => { setSealOpen(false); go('reliquary') }} variant="solid" accent="sage">
                Open the reliquary
              </HaloButton>
              <HaloButton onClick={() => setSealOpen(false)} accent="ember">
                Keep refining
              </HaloButton>
            </div>
          </div>
        ) : (
          <ConsensusFlow
            stage={stage}
            needsWallet={needsWallet}
            walletError={wallet.error}
            connecting={wallet.connecting}
            onConnect={async () => {
              await wallet.connect()
            }}
            txHash={txHash}
            liveStatus={liveStatus}
            peeked={peeked}
            errorMsg={errorMsg}
            onRetry={runLiveSeal}
            onClose={() => setSealOpen(false)}
            motionLevel={motionLevel}
          />
        )}
      </SoftSheet>
    </div>
  )
}

// The consensus lifecycle, rendered in the Kinetic Tapestry language.
function ConsensusFlow({
  stage,
  needsWallet,
  walletError,
  connecting,
  onConnect,
  txHash,
  liveStatus,
  peeked,
  errorMsg,
  onRetry,
  onClose,
  motionLevel
}) {
  if (needsWallet && stage === 'error') {
    return (
      <div>
        <p className="font-serif italic text-lg" style={{ color: 'var(--bone2)' }}>
          A wallet holds the thread.
        </p>
        <p className="font-body text-sm mt-2" style={{ color: 'var(--ash)' }}>
          Connect on the GenLayer Bradbury testnet to let the validators read your ritual. You can also switch to mock mode in Settings to seal locally.
        </p>
        <button
          type="button"
          onClick={onConnect}
          disabled={connecting}
          className="mt-4 font-mono text-[11px] tracking-loom uppercase px-5 py-2.5 rounded-full disabled:opacity-50"
          style={{ background: 'var(--sage)', color: 'var(--ink0)' }}
        >
          {connecting ? 'Connecting' : 'Connect wallet'}
        </button>
        {walletError ? (
          <p className="font-body text-xs mt-2" style={{ color: 'var(--crimson-text, var(--bone2))' }}>
            {walletError}
          </p>
        ) : null}
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--crimson)' }} />
          <MicroNote>The weave paused</MicroNote>
        </div>
        <p className="font-serif italic text-lg" style={{ color: 'var(--bone2)' }}>
          {errorMsg || 'Something interrupted the weave.'}
        </p>
        {txHash ? <TxLine txHash={txHash} /> : null}
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          <HaloButton onClick={onRetry} variant="solid" accent="sage">
            Try again
          </HaloButton>
          <a
            href={FAUCET}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] tracking-wide-mono uppercase px-3 py-1.5 rounded-full"
            style={{ border: '1px solid var(--line2)', color: 'var(--champagne-text)' }}
          >
            Open faucet
          </a>
          <HaloButton onClick={onClose} accent="ember">
            Close
          </HaloButton>
        </div>
      </div>
    )
  }

  // In-flight stages.
  const steps = [
    { key: 'wallet', label: 'Confirm in your wallet' },
    { key: 'submitted', label: 'Submitted to Bradbury' },
    { key: 'consensus', label: 'Consensus is deliberating' }
  ]
  const order = { wallet: 0, submitted: 1, consensus: 2 }
  const current = order[stage] != null ? order[stage] : 0

  return (
    <div>
      <div className="flex flex-col gap-2">
        {steps.map((s, i) => {
          const done = i < current
          const activeStep = i === current
          return (
            <div
              key={s.key}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: activeStep ? 'var(--ink3)' : 'var(--ink2)',
                border: `1px solid ${activeStep ? 'var(--sage)' : 'var(--line1)'}`
              }}
            >
              <motion.span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: done || activeStep ? 'var(--sage)' : 'var(--mute)' }}
                animate={activeStep && motionLevel > 0 ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="font-body text-sm" style={{ color: done || activeStep ? 'var(--bone)' : 'var(--ash)' }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {txHash ? <TxLine txHash={txHash} /> : null}

      {stage === 'consensus' ? (
        <div className="mt-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <MicroNote>Validators deliberating</MicroNote>
            <FloatingTag accent="sage">{STATUS_COPY[liveStatus] || liveStatus || 'Working'}</FloatingTag>
          </div>
          <p className="font-body text-xs mt-2" style={{ color: 'var(--ash)' }}>
            A Bradbury analysis can take from one to several minutes. The weave forms as the leader proposes a reading.
          </p>

          {peeked ? (
            <motion.div
              className="mt-4 rounded-2xl p-4"
              style={{ background: 'var(--ink1)', border: '1px solid var(--line2)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <MicroNote>Leader draft, forming</MicroNote>
                <FloatingTag accent="champagne">{peeked.posture}</FloatingTag>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-3">
                <TempoDial value={(peeked.clarityScore || 0) / 100} label="Clarity" accent="sage" size={64} />
                <TempoDial value={(peeked.frictionScore || 0) / 100} label="Friction" accent="ember" size={64} />
                <TempoDial value={(peeked.balanceScore || 0) / 100} label="Balance" accent="champagne" size={64} />
                <TempoDial value={(peeked.resilienceScore || 0) / 100} label="Resil" accent="sage" size={64} />
              </div>
              {peeked.civicScore ? (
                <p className="font-serif italic text-sm mt-3" style={{ color: 'var(--bone2)' }}>
                  {peeked.civicScore}
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function TxLine({ txHash }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-2" style={{ background: 'var(--ink0)', border: '1px solid var(--line1)' }}>
      <code className="font-mono text-xs break-all" style={{ color: 'var(--champagne-text)' }}>
        {txHash.slice(0, 12)}...{txHash.slice(-8)}
      </code>
      <a
        href={`${EXPLORER}/tx/${txHash}`}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-[10px] tracking-wide-mono uppercase px-3 py-1.5 rounded-full shrink-0"
        style={{ border: '1px solid var(--line2)', color: 'var(--sage-text)' }}
      >
        Explorer
      </a>
    </div>
  )
}
