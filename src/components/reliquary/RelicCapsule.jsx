// RelicCapsule.jsx
// A saved ritual rendered as a sealed living capsule, not a table row. It shows
// an animated weave thumbnail that pulses softly, the identity, and the key
// measures. A radial action menu fans out the available actions.

import { motion } from 'framer-motion'
import RitualWeave from '../loom/RitualWeave.jsx'
import RadialActionMenu from '../shared/RadialActionMenu.jsx'
import { FloatingTag } from '../shared/primitives.jsx'
import { generateRitualArtifact } from '../../utils/generateRitualArtifact.js'
import { complexityOf } from '../../utils/formatters.js'

export default function RelicCapsule({ ritual, onOpen, onDuplicate, onExport, onDelete, motionLevel = 0.85 }) {
  const artifact = ritual.artifact || generateRitualArtifact(ritual)
  const complexity = complexityOf(ritual)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="relative rounded-3xl overflow-hidden group"
      style={{ background: 'linear-gradient(180deg, var(--ink2), var(--ink1))', border: '1px solid var(--line2)' }}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative" style={{ height: 140, background: 'var(--ink0)' }}>
          <motion.div
            className="absolute inset-0"
            animate={motionLevel > 0 ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 4 + artifact.artifactMotionSeed.orbitTempo * 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <RitualWeave steps={ritual.steps} width={360} height={140} compact motionLevel={motionLevel} />
          </motion.div>
          <div className="absolute top-3 left-3">
            <FloatingTag accent="sage">{ritual.type}</FloatingTag>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg" style={{ color: 'var(--bone)' }}>
            {ritual.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <FloatingTag accent="champagne">{ritual.tone}</FloatingTag>
            <FloatingTag accent="ember">{ritual.roles.length} voices</FloatingTag>
            <FloatingTag accent="ember">{ritual.steps.length} stages</FloatingTag>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              ['Clarity', artifact.clarityScore, 'sage'],
              ['Friction', artifact.frictionScore, 'ember'],
              ['Resil', artifact.resilienceScore, 'champagne'],
              ['Cmplx', complexity, 'ember']
            ].map(([k, v, a]) => (
              <div key={k} className="text-center">
                <div className="font-display text-sm" style={{ color: `var(--${a}-text, var(--bone))` }}>
                  {v}
                </div>
                <div className="font-mono text-[8px] tracking-wide-mono uppercase" style={{ color: 'var(--mute)' }}>
                  {k}
                </div>
              </div>
            ))}
          </div>
          {artifact.knots.length > 0 ? (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--crimson)' }}
              />
              <span className="font-mono text-[9px] tracking-wide-mono uppercase" style={{ color: 'var(--ash)' }}>
                {artifact.knots.length} tension{artifact.knots.length > 1 ? 's' : ''}
              </span>
            </div>
          ) : null}
        </div>
      </button>
      <div className="absolute bottom-4 right-4">
        <RadialActionMenu
          actions={[
            { label: 'Open', accent: 'sage', onClick: onOpen },
            { label: 'Echo', accent: 'champagne', onClick: onDuplicate },
            { label: 'Export', accent: 'ember', onClick: onExport },
            { label: 'Release', accent: 'crimson', onClick: onDelete }
          ]}
        />
      </div>
    </motion.div>
  )
}
