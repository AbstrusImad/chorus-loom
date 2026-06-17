// Settings.jsx
// Discreet and elegant controls. Theme, animation intensity, reduced motion,
// visual density, GenLayer mock mode, and local data tools: clear storage,
// export all rituals, import JSON.

import { useRef, useState } from 'react'
import { useApp } from '../store/AppStore.jsx'
import { HaloButton, MicroNote, DriftPanel, RibbonToggle, FloatingTag } from '../components/shared/primitives.jsx'
import { exportRitualsToFile, importRitualsFromFile } from '../utils/exportImport.js'

function Row({ title, note, children }) {
  return (
    <div
      className="flex items-center justify-between gap-6 rounded-2xl px-5 py-4"
      style={{ background: 'var(--ink2)', border: '1px solid var(--line1)' }}
    >
      <div>
        <div className="font-body text-sm" style={{ color: 'var(--bone)' }}>
          {title}
        </div>
        {note ? (
          <div className="font-body text-xs mt-0.5" style={{ color: 'var(--ash)' }}>
            {note}
          </div>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { state, setSettings, clearStorage, importRituals } = useApp()
  const settings = state.settings
  const fileRef = useRef(null)
  const [message, setMessage] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  async function onImportFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    try {
      const rituals = await importRitualsFromFile(file)
      importRituals(rituals)
      setMessage(`Imported ${rituals.length} ritual${rituals.length === 1 ? '' : 's'}.`)
    } catch (err) {
      setMessage(err.message || 'Import failed.')
    }
    e.target.value = ''
  }

  return (
    <div className="h-full w-full overflow-y-auto scroll-quiet px-6 md:px-12 py-12">
      <div className="max-w-3xl mx-auto">
        <DriftPanel>
          <MicroNote>Settings</MicroNote>
          <h2 className="font-display text-4xl mt-2" style={{ color: 'var(--bone)' }}>
            Tune the studio.
          </h2>
        </DriftPanel>

        <div className="flex flex-col gap-3 mt-8">
          <Row title="Theme" note="Dark is the resting state. Light stays elegant.">
            <div className="flex items-center gap-2">
              <HaloButton
                onClick={() => setSettings({ theme: 'dark' })}
                variant={settings.theme === 'dark' ? 'solid' : 'outline'}
                accent="sage"
              >
                Dark
              </HaloButton>
              <HaloButton
                onClick={() => setSettings({ theme: 'light' })}
                variant={settings.theme === 'light' ? 'solid' : 'outline'}
                accent="sage"
              >
                Light
              </HaloButton>
            </div>
          </Row>

          <Row title="Animation intensity" note="How alive the threads, orbs and knots feel.">
            <div className="flex items-center gap-3" style={{ width: 220 }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.animationIntensity}
                onChange={(e) => setSettings({ animationIntensity: parseFloat(e.target.value) })}
                style={{ flex: 1 }}
              />
              <span className="font-mono text-xs w-8 text-right" style={{ color: 'var(--bone2)' }}>
                {Math.round(settings.animationIntensity * 100)}
              </span>
            </div>
          </Row>

          <Row title="Reduced motion" note="Quiet the motion regardless of system setting.">
            <RibbonToggle on={settings.reducedMotion} onChange={(v) => setSettings({ reducedMotion: v })} />
          </Row>

          <Row title="Visual density" note="Comfortable space or a tighter weave.">
            <div className="flex items-center gap-2">
              {['comfortable', 'compact'].map((d) => (
                <HaloButton
                  key={d}
                  onClick={() => setSettings({ density: d })}
                  variant={settings.density === d ? 'solid' : 'outline'}
                  accent="champagne"
                >
                  {d}
                </HaloButton>
              ))}
            </div>
          </Row>

          <Row title="GenLayer mock mode" note="Simulate recording rituals on chain. No network is used.">
            <RibbonToggle on={settings.genlayerMock} onChange={(v) => setSettings({ genlayerMock: v })} />
          </Row>
        </div>

        <div className="mt-10">
          <MicroNote className="mb-3">Local data</MicroNote>
          <div className="flex flex-col gap-3">
            <Row title="Export all rituals" note="Download every ritual as a single JSON file.">
              <HaloButton
                onClick={() => exportRitualsToFile(state.rituals, 'chorus-loom-collection.json')}
                accent="sage"
                variant="outline"
              >
                Export
              </HaloButton>
            </Row>
            <Row title="Import rituals" note="Load rituals from a JSON file. Existing ones are merged by id.">
              <HaloButton onClick={() => fileRef.current && fileRef.current.click()} accent="champagne" variant="outline">
                Import JSON
              </HaloButton>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImportFile} />
            </Row>
            <Row title="Clear local storage" note="Remove all rituals and reset settings. This cannot be undone.">
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <HaloButton
                    onClick={() => {
                      clearStorage()
                      setConfirmClear(false)
                      setMessage('Local storage cleared.')
                    }}
                    accent="crimson"
                    variant="solid"
                  >
                    Confirm
                  </HaloButton>
                  <HaloButton onClick={() => setConfirmClear(false)} accent="ember">
                    Cancel
                  </HaloButton>
                </div>
              ) : (
                <HaloButton onClick={() => setConfirmClear(true)} accent="crimson" variant="outline">
                  Clear
                </HaloButton>
              )}
            </Row>
          </div>
        </div>

        {message ? (
          <div className="mt-6">
            <FloatingTag accent="sage">{message}</FloatingTag>
          </div>
        ) : null}

        <p className="font-mono text-[10px] tracking-wide-mono uppercase mt-10" style={{ color: 'var(--mute)' }}>
          Chorus Loom runs entirely in your browser. No accounts, no servers, no network calls.
        </p>
      </div>
    </div>
  )
}
