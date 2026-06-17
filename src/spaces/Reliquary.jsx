// Reliquary.jsx
// A chamber of living relics. Saved rituals are sealed capsules, not table rows.
// Search and filter the collection, open a relic to read its full Civic Score,
// duplicate it, export it as JSON, or release it.

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppStore.jsx'
import RelicCapsule from '../components/reliquary/RelicCapsule.jsx'
import CivicScorePlate from '../components/shared/CivicScorePlate.jsx'
import { HaloButton, MicroNote, DriftPanel, SoftSheet, FloatingTag } from '../components/shared/primitives.jsx'
import { RITUAL_TYPES } from '../data/constants.js'
import { generateRitualArtifact } from '../utils/generateRitualArtifact.js'
import { exportSingleRitual } from '../utils/exportImport.js'
import { useMotionLevel } from '../components/animations/useMotionLevel.js'

// A live on-chain relic carries verified markers and a synthetic id. When a
// person echoes or refines it, hand back a clean local ritual so it becomes an
// editable draft rather than a frozen verified record.
function stripChainMarkers(ritual) {
  if (!ritual.onChain && !ritual.verified) return ritual
  const { onChain, verified, txHash, contract, explorerUrl, artifact, ...rest } = ritual
  return {
    ...rest,
    id: `rit_local_${Math.random().toString(16).slice(2, 10)}`,
    createdAt: Date.now()
  }
}

export default function Reliquary() {
  const { state, loadDraft, go, duplicateRitual, deleteRitual } = useApp()
  const motionLevel = useMotionLevel()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [openRitual, setOpenRitual] = useState(null)

  const filtered = useMemo(() => {
    // Merge local rituals with the live on-chain feed. On-chain relics are kept
    // distinct and marked verified. We avoid showing the same weave twice when a
    // locally sealed ritual already carries its on-chain id.
    const localOnChainIds = new Set(
      state.rituals
        .map((r) => (r.artifact && r.artifact.onChainId) || null)
        .filter(Boolean)
    )
    const chain = (state.chainRelics || []).filter(
      (c) => !localOnChainIds.has(c.artifact && c.artifact.onChainId)
    )
    const all = [...state.rituals, ...chain]
    return all.filter((r) => {
      const matchesQuery =
        !query ||
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        (r.intention || '').toLowerCase().includes(query.toLowerCase())
      const matchesType = typeFilter === 'All' || r.type === typeFilter
      return matchesQuery && matchesType
    })
  }, [state.rituals, state.chainRelics, query, typeFilter])

  function openRelic(ritual) {
    setOpenRitual(ritual)
  }

  function refine(ritual) {
    loadDraft(stripChainMarkers(ritual))
    setOpenRitual(null)
    go('loom')
  }

  function echo(ritual) {
    duplicateRitual(stripChainMarkers(ritual))
  }

  const openArtifact = openRitual ? openRitual.artifact || generateRitualArtifact(openRitual) : null

  return (
    <div className="h-full w-full overflow-y-auto scroll-quiet px-6 md:px-12 py-10">
      <div className="max-w-6xl mx-auto">
        <DriftPanel>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <MicroNote>Reliquary</MicroNote>
              <h2 className="font-display text-4xl mt-2" style={{ color: 'var(--bone)' }}>
                Sealed rituals, kept as living relics.
              </h2>
            </div>
            <HaloButton onClick={() => go('seed')} variant="solid" accent="sage">
              Weave a new ritual
            </HaloButton>
          </div>
        </DriftPanel>

        <div className="flex items-center gap-3 mt-8 flex-wrap">
          <input
            className="loom-input"
            style={{ maxWidth: 320 }}
            placeholder="Search rituals"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', ...RITUAL_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="font-mono text-[10px] tracking-wide-mono uppercase px-3 py-1.5 rounded-full"
                style={{
                  background: typeFilter === t ? 'var(--ink4)' : 'transparent',
                  border: '1px solid var(--line2)',
                  color: typeFilter === t ? 'var(--bone)' : 'var(--ash)'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl mt-10 p-16 text-center" style={{ background: 'var(--ink1)', border: '1px solid var(--line2)' }}>
            <p className="font-serif italic text-lg" style={{ color: 'var(--ash)' }}>
              No relics here yet. Weave a ritual and seal it to fill the chamber.
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <AnimatePresence>
              {filtered.map((ritual) => (
                <RelicCapsule
                  key={ritual.id}
                  ritual={ritual}
                  motionLevel={motionLevel}
                  onOpen={() => openRelic(ritual)}
                  onDuplicate={() => echo(ritual)}
                  onExport={() => exportSingleRitual(ritual)}
                  onDelete={() => deleteRitual(ritual.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <SoftSheet open={Boolean(openRitual)} onClose={() => setOpenRitual(null)} title={openRitual ? openRitual.name : ''} width={580}>
        {openArtifact ? (
          <div>
            {openRitual.intention ? (
              <p className="font-serif italic text-base mb-4" style={{ color: 'var(--bone2)' }}>
                {openRitual.intention}
              </p>
            ) : null}
            <CivicScorePlate artifact={openArtifact} ritual={openRitual} motionLevel={motionLevel} />
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              <HaloButton onClick={() => refine(openRitual)} variant="solid" accent="sage">
                Refine in the loom
              </HaloButton>
              <HaloButton onClick={() => echo(openRitual)} accent="champagne">
                Echo
              </HaloButton>
              <HaloButton onClick={() => exportSingleRitual(openRitual)} accent="ember">
                Export JSON
              </HaloButton>
              {openRitual.onChain && openRitual.explorerUrl ? (
                <a
                  href={openRitual.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] tracking-loom uppercase px-4 py-2 rounded-full"
                  style={{ border: '1px solid var(--sage)', color: 'var(--sage-text)' }}
                >
                  View on explorer
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </SoftSheet>
    </div>
  )
}
