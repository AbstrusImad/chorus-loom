// App.jsx
// The studio shell. Holds the ambient backdrop, the chamber rail, and the
// camera like transitions between chambers. Each chamber slides in along the
// score; light shifts subtly as the active chamber changes.

import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from './store/AppStore.jsx'
import ThreadField from './components/animations/ThreadField.jsx'
import ChamberRail from './components/shared/ChamberRail.jsx'
import { CHAMBERS } from './data/constants.js'

import Threshold from './spaces/Threshold.jsx'
import SeedTable from './spaces/SeedTable.jsx'
import RoleChorus from './spaces/RoleChorus.jsx'
import LoomStage from './spaces/LoomStage.jsx'
import KnotField from './spaces/KnotField.jsx'
import PlaybackHall from './spaces/PlaybackHall.jsx'
import Reliquary from './spaces/Reliquary.jsx'
import Settings from './spaces/Settings.jsx'

const SPACES = {
  threshold: Threshold,
  seed: SeedTable,
  chorus: RoleChorus,
  loom: LoomStage,
  knots: KnotField,
  playback: PlaybackHall,
  reliquary: Reliquary,
  settings: Settings
}

// Ambient hue and tempo per chamber so the light shifts as you move.
const AMBIENCE = {
  threshold: { hue: 'sage', tempo: 0.3, density: 0.8 },
  seed: { hue: 'champagne', tempo: 0.35, density: 0.45 },
  chorus: { hue: 'sage', tempo: 0.5, density: 0.5 },
  loom: { hue: 'champagne', tempo: 0.45, density: 0.55 },
  knots: { hue: 'crimson', tempo: 0.6, density: 0.5 },
  playback: { hue: 'sage', tempo: 0.55, density: 0.6 },
  reliquary: { hue: 'ember', tempo: 0.35, density: 0.4 },
  settings: { hue: 'ember', tempo: 0.3, density: 0.35 }
}

function chamberIndex(id) {
  const i = CHAMBERS.findIndex((c) => c.id === id)
  return i < 0 ? 0 : i
}

export default function App() {
  const { state, go } = useApp()
  const { chamber, previousChamber, entered } = state

  const dir = chamberIndex(chamber) >= chamberIndex(previousChamber || 'threshold') ? 1 : -1
  const Space = SPACES[chamber] || SeedTable
  const amb = AMBIENCE[chamber] || AMBIENCE.seed

  return (
    <div className="relative h-full w-full" style={{ background: 'var(--ink0)' }}>
      {/* Ambient backdrop, persists across chambers but shifts hue. */}
      {chamber !== 'threshold' ? (
        <div className="absolute inset-0 z-0 opacity-70">
          <ThreadField density={amb.density} tempo={amb.tempo} hue={amb.hue} />
          <div className="absolute inset-0 vignette pointer-events-none" />
        </div>
      ) : null}

      {entered && chamber !== 'threshold' ? <ChamberRail active={chamber} onGo={go} /> : null}

      <div className="relative z-10 h-full w-full" style={{ paddingLeft: entered && chamber !== 'threshold' ? 64 : 0 }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={chamber}
            custom={dir}
            className="h-full w-full"
            initial={{ opacity: 0, x: dir * 60, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: dir * -60, filter: 'blur(6px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Space />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
