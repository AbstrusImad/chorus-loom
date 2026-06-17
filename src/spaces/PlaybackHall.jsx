// PlaybackHall.jsx
// The ritual plays back as an abstract choreography. Stages activate in
// sequence, roles enter the chorus, pauses hold, decisions surface. Controls let
// the viewer slow down, speed up, isolate decision points or safeguards, and
// highlight a single role. Sealing the ritual produces the Civic Score artifact
// and records it through the GenLayer mock.

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../store/AppStore.jsx'
import RitualWeave from '../components/loom/RitualWeave.jsx'
import CivicScorePlate from '../components/shared/CivicScorePlate.jsx'
import RoleOrb from '../components/chorus/RoleOrb.jsx'
import { HaloButton, MicroNote, DriftPanel, FloatingTag, SoftSheet } from '../components/shared/primitives.jsx'
import { getGestureById, DECISION_KINDS, PAUSE_KINDS } from '../data/gestureLibrary.js'
import { getRoleById } from '../data/roleLibrary.js'
import { generateRitualArtifact } from '../utils/generateRitualArtifact.js'
import { createRitualRecord, registerCivicScore, isGenLayerMock } from '../genlayer/genlayerClient.js'
import { useMotionLevel } from '../components/animations/useMotionLevel.js'

export default function PlaybackHall() {
  const { state, go, sealRitual } = useApp()
  const draft = state.draft
  const motionLevel = useMotionLevel()
  const steps = draft.steps

  const [active, setActive] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [filter, setFilter] = useState('all')
  const [roleHighlight, setRoleHighlight] = useState(null)
  const [sealed, setSealed] = useState(false)
  const [artifact, setArtifact] = useState(null)
  const [genStatus, setGenStatus] = useState(null)
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

  // Roles enter as playback advances.
  const roleEntryThreshold = steps.length > 0 ? (active + 1) / steps.length : 0

  async function seal() {
    const art = sealRitual()
    setArtifact(art)
    setSealed(true)
    if (isGenLayerMock()) {
      setGenStatus('recording')
      try {
        await createRitualRecord({ ...draft, id: art.ritualId })
        const reg = await registerCivicScore(art)
        setGenStatus(reg.status === 'finalized' ? 'finalized' : 'recorded')
      } catch (err) {
        setGenStatus('error')
      }
    } else {
      setGenStatus('offline')
    }
  }

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
            Seal the Civic Score
          </HaloButton>
        </div>
      </div>

      <SoftSheet open={sealed} onClose={() => setSealed(false)} title="The ritual is sealed" width={560}>
        {artifact ? (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <FloatingTag accent="sage">sealed to reliquary</FloatingTag>
              {genStatus ? <FloatingTag accent="champagne">genlayer {genStatus}</FloatingTag> : null}
            </div>
            <CivicScorePlate artifact={artifact} ritual={draft} motionLevel={motionLevel} />
            <div className="flex items-center justify-between mt-5">
              <HaloButton onClick={() => { setSealed(false); go('reliquary') }} variant="solid" accent="sage">
                Open the reliquary
              </HaloButton>
              <HaloButton onClick={() => setSealed(false)} accent="ember">
                Keep refining
              </HaloButton>
            </div>
          </div>
        ) : null}
      </SoftSheet>
    </div>
  )
}
