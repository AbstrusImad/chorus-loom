// RoleChorus.jsx
// Choose the ritual's actors. Roles float in a choral ring as voices. Selecting
// a role pulls it into the chorus. A focused role reveals its capacities: how
// loud it is, whether it can act, block, wait or observe.

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppStore.jsx'
import RoleOrb from '../components/chorus/RoleOrb.jsx'
import { HaloButton, MicroNote, DriftPanel, FloatingTag } from '../components/shared/primitives.jsx'
import { ROLE_LIBRARY, getRoleById } from '../data/roleLibrary.js'

function CapacityBar({ label, value, accent }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[9px] tracking-wide-mono uppercase w-24 shrink-0" style={{ color: 'var(--ash)' }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--ink4)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `var(--${accent})` }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

export default function RoleChorus() {
  const { state, setDraft, go } = useApp()
  const draft = state.draft
  const [focus, setFocus] = useState(null)

  const selected = draft.roles
  const focusRole = focus ? getRoleById(focus) : selected.length ? getRoleById(selected[selected.length - 1]) : null

  function toggle(id) {
    setFocus(id)
    if (selected.includes(id)) {
      setDraft({ roles: selected.filter((r) => r !== id) })
    } else {
      setDraft({ roles: [...selected, id] })
    }
  }

  const ring = useMemo(() => {
    const n = ROLE_LIBRARY.length
    const radius = 240
    return ROLE_LIBRARY.map((role, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      return {
        role,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.78
      }
    })
  }, [])

  return (
    <div className="h-full w-full overflow-y-auto scroll-quiet px-6 md:px-12 py-10">
      <div className="max-w-6xl mx-auto">
        <DriftPanel>
          <MicroNote>Role Chorus</MicroNote>
          <h2 className="font-display text-4xl mt-2" style={{ color: 'var(--bone)' }}>
            Call the voices into the ring.
          </h2>
          <p className="font-serif italic text-lg mt-3" style={{ color: 'var(--bone2)' }}>
            Each role you choose becomes a voice, a tone in the chorus of the ritual.
          </p>
        </DriftPanel>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8 items-start">
          <div className="relative flex items-center justify-center" style={{ minHeight: 560 }}>
            {/* Ring guideline */}
            <div
              className="absolute rounded-full"
              style={{ width: 500, height: 392, border: '1px dashed var(--line1)' }}
            />
            <div className="absolute text-center pointer-events-none">
              <div className="font-display text-3xl" style={{ color: 'var(--bone)' }}>
                {selected.length}
              </div>
              <MicroNote>voices chosen</MicroNote>
            </div>
            {ring.map(({ role, x, y }, i) => (
              <div
                key={role.id}
                className="absolute"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <RoleOrb
                  role={role}
                  selected={selected.includes(role.id)}
                  onClick={() => toggle(role.id)}
                  floatSeed={i % 5}
                />
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-6 flex flex-col gap-4">
            <div
              className="rounded-3xl p-5"
              style={{ background: 'linear-gradient(180deg, var(--ink2), var(--ink1))', border: '1px solid var(--line2)' }}
            >
              {focusRole ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl" style={{ color: 'var(--bone)' }}>
                      {focusRole.name}
                    </h3>
                    <FloatingTag accent={focusRole.accent}>
                      {selected.includes(focusRole.id) ? 'in chorus' : 'available'}
                    </FloatingTag>
                  </div>
                  <p className="font-serif italic text-sm mt-2 mb-4" style={{ color: 'var(--bone2)' }}>
                    {focusRole.essence}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <CapacityBar label="Weight" value={focusRole.weight} accent="sage" />
                    <CapacityBar label="Visibility" value={focusRole.visibility} accent="champagne" />
                    <CapacityBar label="Intervention" value={focusRole.intervention} accent="sage" />
                    <CapacityBar label="Block" value={focusRole.block} accent="crimson" />
                    <CapacityBar label="Wait" value={focusRole.wait} accent="ember" />
                    <CapacityBar label="Observation" value={focusRole.observation} accent="champagne" />
                  </div>
                  <div className="mt-4">
                    <HaloButton
                      onClick={() => toggle(focusRole.id)}
                      variant={selected.includes(focusRole.id) ? 'outline' : 'solid'}
                      accent={selected.includes(focusRole.id) ? 'ember' : 'sage'}
                    >
                      {selected.includes(focusRole.id) ? 'Release voice' : 'Add to chorus'}
                    </HaloButton>
                  </div>
                </>
              ) : (
                <p className="font-body text-sm" style={{ color: 'var(--ash)' }}>
                  Touch a voice to read its capacities.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.map((id) => {
                const r = getRoleById(id)
                if (!r) return null
                return (
                  <FloatingTag key={id} accent={r.accent}>
                    {r.name}
                  </FloatingTag>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <HaloButton onClick={() => go('seed')} accent="ember">
            Back to seed
          </HaloButton>
          <HaloButton
            onClick={() => go('loom')}
            variant="solid"
            accent="sage"
            disabled={selected.length === 0}
            title={selected.length ? 'Move to the Loom Stage' : 'Choose at least one voice'}
          >
            Weave the stages
          </HaloButton>
        </div>
      </div>
    </div>
  )
}
