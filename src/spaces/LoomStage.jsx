// LoomStage.jsx
// The main chamber. Build the ritual as a spatial and temporal sequence of
// gestures stitched together with threads. The user draws gestures from the
// palette onto the stage, reorders them, lifts them into layers, and weaves
// safeguards and thresholds around the choreography.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../store/AppStore.jsx'
import StageGlyph from '../components/loom/StageGlyph.jsx'
import RitualWeave from '../components/loom/RitualWeave.jsx'
import SafeguardHalo from '../components/loom/SafeguardHalo.jsx'
import { HaloButton, MicroNote, DriftPanel, FloatingTag } from '../components/shared/primitives.jsx'
import { GESTURE_LIBRARY, getGestureById } from '../data/gestureLibrary.js'
import { SAFEGUARDS_LIBRARY } from '../data/safeguardsLibrary.js'
import { useMotionLevel } from '../components/animations/useMotionLevel.js'

let stepCounter = 0
function makeStepId(gestureId) {
  stepCounter += 1
  return `step_${gestureId}_${Date.now().toString(36)}_${stepCounter}`
}

export default function LoomStage() {
  const { state, setDraft, go } = useApp()
  const draft = state.draft
  const motionLevel = useMotionLevel()
  const [selectedStep, setSelectedStep] = useState(null)
  const [thresholdText, setThresholdText] = useState('')
  const [tab, setTab] = useState('gestures')

  const steps = draft.steps

  function addGesture(gestureId) {
    const step = { id: makeStepId(gestureId), gestureId, lane: 0 }
    setDraft({ steps: [...steps, step] })
    setSelectedStep(step.id)
  }

  function removeStep(id) {
    setDraft({ steps: steps.filter((s) => s.id !== id) })
    if (selectedStep === id) setSelectedStep(null)
  }

  function moveStep(id, dir) {
    const idx = steps.findIndex((s) => s.id === id)
    const target = idx + dir
    if (idx < 0 || target < 0 || target >= steps.length) return
    const next = steps.slice()
    const [item] = next.splice(idx, 1)
    next.splice(target, 0, item)
    setDraft({ steps: next })
  }

  function cycleLane(id) {
    setDraft({
      steps: steps.map((s) => (s.id === id ? { ...s, lane: ((s.lane || 0) + 1) % 4 } : s))
    })
  }

  function toggleSafeguard(id) {
    const has = draft.safeguards.includes(id)
    setDraft({
      safeguards: has ? draft.safeguards.filter((s) => s !== id) : [...draft.safeguards, id]
    })
  }

  function addThreshold() {
    const t = thresholdText.trim()
    if (!t) return
    setDraft({ thresholds: [...draft.thresholds, t] })
    setThresholdText('')
  }

  function removeThreshold(i) {
    setDraft({ thresholds: draft.thresholds.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="h-full w-full overflow-y-auto scroll-quiet px-6 md:px-10 py-8">
      <div className="max-w-6xl mx-auto">
        <DriftPanel>
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <MicroNote>Loom Stage</MicroNote>
              <h2 className="font-display text-4xl mt-2" style={{ color: 'var(--bone)' }}>
                {draft.name || 'Untitled ritual'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <FloatingTag accent="sage">{draft.type}</FloatingTag>
              <FloatingTag accent="champagne">{draft.tone}</FloatingTag>
              <FloatingTag accent="ember">{steps.length} stages</FloatingTag>
            </div>
          </div>
        </DriftPanel>

        {/* Live weave preview */}
        <motion.div
          className="rounded-3xl mt-6 overflow-hidden"
          style={{ background: 'var(--ink1)', border: '1px solid var(--line2)', height: 260 }}
          layout
        >
          {steps.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="font-serif italic text-lg" style={{ color: 'var(--ash)' }}>
                The stage is empty. Draw a gesture to begin the weave.
              </p>
            </div>
          ) : (
            <RitualWeave steps={steps} width={900} height={260} motionLevel={motionLevel} onNodeClick={(i) => setSelectedStep(steps[i].id)} />
          )}
        </motion.div>

        {/* Sequence of placed gestures */}
        <div className="mt-6">
          <MicroNote className="mb-3">The sequence</MicroNote>
          <div className="flex items-center gap-4 overflow-x-auto scroll-quiet pb-4">
            <AnimatePresence>
              {steps.map((s, i) => {
                const g = getGestureById(s.gestureId)
                if (!g) return null
                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-2 shrink-0"
                    style={{ marginTop: (s.lane || 0) * 10 }}
                  >
                    <StageGlyph
                      gesture={g}
                      index={i}
                      selected={selectedStep === s.id}
                      onClick={() => setSelectedStep(selectedStep === s.id ? null : s.id)}
                      motionLevel={motionLevel}
                    />
                    {selectedStep === s.id ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1"
                      >
                        <button onClick={() => moveStep(s.id, -1)} title="Move earlier" className="loom-mini">&lt;</button>
                        <button onClick={() => cycleLane(s.id)} title="Lift into layer" className="loom-mini">L{s.lane || 0}</button>
                        <button onClick={() => moveStep(s.id, 1)} title="Move later" className="loom-mini">&gt;</button>
                        <button onClick={() => removeStep(s.id)} title="Remove" className="loom-mini" style={{ color: 'var(--crimson)' }}>x</button>
                      </motion.div>
                    ) : (
                      <span className="font-mono text-[8px] tracking-wide-mono uppercase" style={{ color: 'var(--mute)' }}>
                        layer {s.lane || 0}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Tools */}
        <div className="mt-4 flex items-center gap-2">
          {['gestures', 'safeguards', 'thresholds'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-mono text-[10px] tracking-wide-mono uppercase px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: tab === t ? 'var(--ink4)' : 'transparent',
                border: '1px solid var(--line2)',
                color: tab === t ? 'var(--bone)' : 'var(--ash)'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          className="rounded-3xl mt-3 p-5"
          style={{ background: 'linear-gradient(180deg, var(--ink2), var(--ink1))', border: '1px solid var(--line2)' }}
        >
          {tab === 'gestures' ? (
            <div className="flex flex-wrap gap-2">
              {GESTURE_LIBRARY.map((g) => (
                <motion.button
                  key={g.id}
                  onClick={() => addGesture(g.id)}
                  whileHover={{ y: -2, boxShadow: `0 0 18px var(--${g.accent}-glow)` }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl px-3 py-2 text-left"
                  style={{ background: 'var(--ink2)', border: `1px solid var(--line2)`, width: 140 }}
                  title={g.note}
                >
                  <div className="font-display text-sm" style={{ color: `var(--${g.accent}-text, var(--bone))` }}>
                    {g.name}
                  </div>
                  <div className="font-mono text-[8px] tracking-wide-mono uppercase mt-0.5" style={{ color: 'var(--mute)' }}>
                    {g.kind}
                  </div>
                </motion.button>
              ))}
            </div>
          ) : null}

          {tab === 'safeguards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAFEGUARDS_LIBRARY.map((s) => (
                <SafeguardHalo
                  key={s.id}
                  safeguard={s}
                  active={draft.safeguards.includes(s.id)}
                  onClick={() => toggleSafeguard(s.id)}
                />
              ))}
            </div>
          ) : null}

          {tab === 'thresholds' ? (
            <div>
              <div className="flex gap-2">
                <input
                  className="loom-input"
                  placeholder="2 reviewers minimum"
                  value={thresholdText}
                  onChange={(e) => setThresholdText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addThreshold()}
                />
                <HaloButton onClick={addThreshold} variant="solid" accent="sage">
                  Add
                </HaloButton>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {draft.thresholds.length === 0 ? (
                  <p className="font-body text-sm" style={{ color: 'var(--ash)' }}>
                    No thresholds yet. Thresholds are the conditions a ritual must meet to proceed.
                  </p>
                ) : (
                  draft.thresholds.map((t, i) => (
                    <button
                      key={`${t}-${i}`}
                      onClick={() => removeThreshold(i)}
                      className="font-mono text-[10px] tracking-wide-mono uppercase px-3 py-1.5 rounded-full"
                      style={{ background: 'var(--ink3)', border: '1px solid var(--line2)', color: 'var(--bone2)' }}
                      title="Remove threshold"
                    >
                      {t}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between mt-8">
          <HaloButton onClick={() => go('chorus')} accent="ember">
            Back to chorus
          </HaloButton>
          <HaloButton
            onClick={() => go('knots')}
            variant="solid"
            accent="sage"
            disabled={steps.length === 0}
            title={steps.length ? 'Reveal the tensions' : 'Place at least one gesture'}
          >
            Reveal the tensions
          </HaloButton>
        </div>
      </div>
    </div>
  )
}
