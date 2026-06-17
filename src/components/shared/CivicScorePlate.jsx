// CivicScorePlate.jsx
// The Civic Score: a living visual artifact, not a report. It presents the
// ritual identity, an animated weave, the four measures as dials, the active
// knots and the GenLayer mock proof. Used after sealing a ritual and inside the
// Reliquary detail.

import { motion } from 'framer-motion'
import RitualWeave from '../loom/RitualWeave.jsx'
import TempoDial from '../loom/TempoDial.jsx'
import { FloatingTag, MicroNote } from './primitives.jsx'
import { complexityOf } from '../../utils/formatters.js'
import { EXPLORER } from '../../genlayer/genlayerClient.js'

export default function CivicScorePlate({ artifact, ritual, motionLevel = 0.85 }) {
  if (!artifact) return null
  const seed = artifact.artifactMotionSeed
  const complexity = complexityOf(ritual || artifact)

  return (
    <motion.div
      className="rounded-3xl overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--ink2), var(--ink1))', border: '1px solid var(--line2)' }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'var(--line1)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <MicroNote>Civic Score</MicroNote>
            <h3 className="font-display text-2xl mt-1" style={{ color: 'var(--bone)' }}>
              {artifact.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FloatingTag accent="sage">{artifact.type}</FloatingTag>
            <FloatingTag accent="champagne">{artifact.tone}</FloatingTag>
            <FloatingTag accent="ember">{artifact.roles.length} voices</FloatingTag>
            <FloatingTag accent="ember">{artifact.steps.length} stages</FloatingTag>
          </div>
        </div>
        <p className="font-serif italic text-lg mt-4" style={{ color: 'var(--bone2)' }}>
          {artifact.civicScore}
        </p>
      </div>

      <div className="relative" style={{ height: 240, background: 'var(--ink1)' }}>
        <RitualWeave steps={artifact.steps} width={760} height={240} motionLevel={motionLevel} />
      </div>

      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t" style={{ borderColor: 'var(--line1)' }}>
        <TempoDial value={artifact.clarityScore / 100} label="Clarity" accent="sage" />
        <TempoDial value={artifact.frictionScore / 100} label="Friction" accent="ember" />
        <TempoDial value={artifact.balanceScore / 100} label="Balance" accent="champagne" />
        <TempoDial value={artifact.resilienceScore / 100} label="Resilience" accent="sage" />
      </div>

      <div className="px-6 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <TempoDial value={complexity / 100} label="Complexity" accent="ember" size={72} />
        <TempoDial value={seed.orbitTempo} label="Tempo" accent="sage" size={72} />
        <TempoDial value={seed.threadDensity} label="Thread density" accent="champagne" size={72} />
        <TempoDial value={seed.knotIntensity} label="Knot intensity" accent="crimson" size={72} />
      </div>

      <div className="p-6 border-t" style={{ borderColor: 'var(--line1)' }}>
        <MicroNote className="mb-3">Active tensions</MicroNote>
        {artifact.knots.length === 0 ? (
          <p className="font-body text-sm" style={{ color: 'var(--ash)' }}>
            No open tensions. The weave holds.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {artifact.knots.map((k) => (
              <div
                key={k.name}
                className="flex items-start justify-between gap-4 rounded-xl px-4 py-2"
                style={{ background: 'var(--ink2)', border: '1px solid var(--line1)' }}
              >
                <div>
                  <span className="font-body text-sm" style={{ color: 'var(--bone)' }}>
                    {k.name}
                  </span>
                  <p className="font-body text-xs mt-0.5" style={{ color: 'var(--ash)' }}>
                    {k.reason}
                  </p>
                </div>
                <FloatingTag accent={k.severity === 'High' ? 'crimson' : k.severity === 'Medium' ? 'ember' : 'champagne'}>
                  {k.severity}
                </FloatingTag>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="px-6 py-4 border-t flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor: 'var(--line1)', background: 'var(--ink0)' }}
      >
        {artifact.verified ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <FloatingTag accent="sage">verified on genlayer</FloatingTag>
              {artifact.posture ? <FloatingTag accent="champagne">{artifact.posture}</FloatingTag> : null}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {artifact.txHash ? (
                <a
                  href={`${EXPLORER}/tx/${artifact.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs break-all"
                  style={{ color: 'var(--sage-text)' }}
                >
                  {artifact.txHash.slice(0, 12)}...{artifact.txHash.slice(-8)}
                </a>
              ) : artifact.contract ? (
                <a
                  href={`${EXPLORER}/address/${artifact.contract}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs break-all"
                  style={{ color: 'var(--sage-text)' }}
                >
                  {artifact.contract.slice(0, 10)}...{artifact.contract.slice(-6)}
                </a>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <MicroNote>GenLayer mock proof</MicroNote>
            <code className="font-mono text-xs break-all" style={{ color: 'var(--champagne-text)' }}>
              {artifact.mockProof}
            </code>
          </>
        )}
      </div>
    </motion.div>
  )
}
