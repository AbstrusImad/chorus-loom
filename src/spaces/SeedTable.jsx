// SeedTable.jsx
// Where a ritual is born. A composition table of living tiles, not a flat form.
// The user names the ritual, chooses its type, intention and tone.

import { useApp } from '../store/AppStore.jsx'
import SeedTile from '../components/seed/SeedTile.jsx'
import { ToneChip, HaloButton, DriftPanel, MicroNote } from '../components/shared/primitives.jsx'
import { RITUAL_TYPES, RITUAL_TONES } from '../data/constants.js'

export default function SeedTable() {
  const { state, setDraft, go, resetDraft } = useApp()
  const draft = state.draft

  const canContinue = draft.name.trim().length > 0

  return (
    <div className="h-full w-full overflow-y-auto scroll-quiet px-6 md:px-12 py-12">
      <div className="max-w-5xl mx-auto">
        <DriftPanel>
          <MicroNote>Seed Table</MicroNote>
          <h2 className="font-display text-4xl mt-2" style={{ color: 'var(--bone)' }}>
            Name the ritual you will weave.
          </h2>
          <p className="font-serif italic text-lg mt-3" style={{ color: 'var(--bone2)' }}>
            Every ceremony begins as a seed: a name, an intention and a tone.
          </p>
        </DriftPanel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          <SeedTile label="Ritual name" hint="required" span={2} delay={0.05}>
            <input
              className="loom-input font-display text-xl"
              placeholder="Treasury Release Ceremony"
              value={draft.name}
              onChange={(e) => setDraft({ name: e.target.value })}
            />
          </SeedTile>

          <SeedTile label="Type" delay={0.1}>
            <select
              className="loom-input"
              value={draft.type}
              onChange={(e) => setDraft({ type: e.target.value })}
            >
              {RITUAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </SeedTile>

          <SeedTile label="Main intention" delay={0.15}>
            <input
              className="loom-input"
              placeholder="What should this ritual protect or enable?"
              value={draft.intention}
              onChange={(e) => setDraft({ intention: e.target.value })}
            />
          </SeedTile>

          <SeedTile label="Tone" span={2} delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {RITUAL_TONES.map((tone) => (
                <ToneChip
                  key={tone.id}
                  label={tone.id}
                  note={tone.note}
                  accent={tone.accent}
                  active={draft.tone === tone.id}
                  onClick={() => setDraft({ tone: tone.id })}
                />
              ))}
            </div>
          </SeedTile>
        </div>

        <div className="flex items-center justify-between mt-10">
          <HaloButton onClick={resetDraft} accent="ember">
            Clear seed
          </HaloButton>
          <HaloButton
            onClick={() => go('chorus')}
            variant="solid"
            accent="sage"
            disabled={!canContinue}
            title={canContinue ? 'Continue to the Role Chorus' : 'Name the ritual first'}
          >
            Gather the voices
          </HaloButton>
        </div>
      </div>
    </div>
  )
}
