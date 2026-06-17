// KnotField.jsx
// A living field of tensions. Knots detected in the weave appear as torsions and
// pulses, never as a warning list. Entering a knot lets the user respond:
// soften, split, accept, document or redirect it.

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppStore.jsx'
import KnotPulse from '../components/knots/KnotPulse.jsx'
import { HaloButton, MicroNote, DriftPanel, SoftSheet, FloatingTag } from '../components/shared/primitives.jsx'
import { detectRitualKnots } from '../utils/detectRitualKnots.js'
import { useMotionLevel } from '../components/animations/useMotionLevel.js'

const RESPONSES = [
  { id: 'soften', label: 'Soften', note: 'Acknowledge the tension and ease it gradually.', accent: 'sage' },
  { id: 'split', label: 'Split', note: 'Divide the responsibility across more voices.', accent: 'champagne' },
  { id: 'accept', label: 'Accept', note: 'Keep the tension on purpose, with eyes open.', accent: 'ember' },
  { id: 'document', label: 'Document', note: 'Record why the tension exists for those who follow.', accent: 'champagne' },
  { id: 'redirect', label: 'Redirect', note: 'Route the energy into a different part of the weave.', accent: 'sage' }
]

export default function KnotField() {
  const { state, setDraft, go } = useApp()
  const draft = state.draft
  const motionLevel = useMotionLevel()
  const [openKnot, setOpenKnot] = useState(null)

  const knots = useMemo(
    () => detectRitualKnots(draft.roles, draft.steps, draft.safeguards, draft.thresholds),
    [draft.roles, draft.steps, draft.safeguards, draft.thresholds]
  )

  const resolutions = draft.knotResolutions || {}

  function respond(knotName, responseId) {
    setDraft({ knotResolutions: { ...resolutions, [knotName]: responseId } })
    setOpenKnot(null)
  }

  return (
    <div className="h-full w-full overflow-y-auto scroll-quiet px-6 md:px-12 py-10">
      <div className="max-w-6xl mx-auto">
        <DriftPanel>
          <MicroNote>Knot Field</MicroNote>
          <h2 className="font-display text-4xl mt-2" style={{ color: 'var(--bone)' }}>
            Where the weave pulls against itself.
          </h2>
          <p className="font-serif italic text-lg mt-3" style={{ color: 'var(--bone2)' }}>
            Tensions are not errors. They are places where the ritual concentrates force. Enter a knot to respond.
          </p>
        </DriftPanel>

        {knots.length === 0 ? (
          <motion.div
            className="rounded-3xl mt-10 p-16 text-center"
            style={{ background: 'var(--ink1)', border: '1px solid var(--line2)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="mx-auto mb-6"
              style={{ width: 80, height: 80, borderRadius: '999px', border: '1px solid var(--sage)' }}
              animate={motionLevel > 0 ? { scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <h3 className="font-display text-2xl" style={{ color: 'var(--bone)' }}>
              The weave holds.
            </h3>
            <p className="font-serif italic text-lg mt-2" style={{ color: 'var(--ash)' }}>
              No tensions surfaced in this composition.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-wrap gap-6 mt-10 justify-center">
            {knots.map((k) => (
              <div key={k.name} className="relative">
                <KnotPulse knot={k} motionLevel={motionLevel} onClick={() => setOpenKnot(k)} />
                {resolutions[k.name] ? (
                  <div className="absolute -bottom-2 left-1/2" style={{ transform: 'translateX(-50%)' }}>
                    <FloatingTag accent="sage">{resolutions[k.name]}</FloatingTag>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-12">
          <HaloButton onClick={() => go('loom')} accent="ember">
            Back to stage
          </HaloButton>
          <HaloButton onClick={() => go('playback')} variant="solid" accent="sage">
            Watch it move
          </HaloButton>
        </div>
      </div>

      <SoftSheet open={Boolean(openKnot)} onClose={() => setOpenKnot(null)} title={openKnot ? openKnot.name : ''}>
        {openKnot ? (
          <div>
            <FloatingTag accent={openKnot.severity === 'High' ? 'crimson' : openKnot.severity === 'Medium' ? 'ember' : 'champagne'}>
              {openKnot.severity} tension
            </FloatingTag>
            <p className="font-body text-sm mt-4" style={{ color: 'var(--bone2)' }}>
              {openKnot.reason}
            </p>
            <div className="rounded-xl p-4 mt-4" style={{ background: 'var(--ink2)', border: '1px solid var(--line1)' }}>
              <MicroNote className="mb-1">A way through</MicroNote>
              <p className="font-body text-sm" style={{ color: 'var(--bone)' }}>
                {openKnot.suggestion}
              </p>
            </div>
            <MicroNote className="mt-6 mb-3">Respond to the knot</MicroNote>
            <div className="flex flex-col gap-2">
              {RESPONSES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => respond(openKnot.name, r.id)}
                  className="text-left rounded-xl px-4 py-3 transition-all duration-300"
                  style={{ background: 'var(--ink2)', border: '1px solid var(--line2)' }}
                >
                  <span className="font-body text-sm" style={{ color: `var(--${r.accent}-text, var(--bone))` }}>
                    {r.label}
                  </span>
                  <p className="font-body text-xs mt-0.5" style={{ color: 'var(--ash)' }}>
                    {r.note}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </SoftSheet>
    </div>
  )
}
