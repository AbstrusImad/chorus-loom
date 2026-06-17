// AppStore.jsx
// The single source of truth for Chorus Loom. Holds settings, the saved rituals
// in the Reliquary, the ritual currently being composed (the draft), and the
// active chamber. Navigation between chambers is exposed as a state change so
// that transitions can be rendered as camera moves rather than page jumps.

import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react'
import {
  loadRituals,
  saveRituals,
  loadSettings,
  saveSettings,
  hasSeeded,
  markSeeded,
  clearAll,
  DEFAULT_SETTINGS
} from '../utils/storage.js'
import { DEMO_RITUALS } from '../data/demoRituals.js'
import { generateRitualArtifact } from '../utils/generateRitualArtifact.js'
import { setGenLayerMock } from '../genlayer/genlayerClient.js'

const AppContext = createContext(null)

function emptyDraft() {
  return {
    id: null,
    name: '',
    type: 'Proposal Flow',
    tone: 'Deliberate',
    intention: '',
    roles: [],
    steps: [],
    safeguards: [],
    thresholds: [],
    paths: []
  }
}

function initState() {
  const settings = loadSettings()
  setGenLayerMock(settings.genlayerMock)
  let rituals = loadRituals()
  if (rituals == null) {
    if (!hasSeeded()) {
      rituals = DEMO_RITUALS.map((r) => ({ ...r, createdAt: Date.now(), sealed: true }))
      markSeeded()
    } else {
      rituals = []
    }
  }
  return {
    chamber: 'threshold',
    previousChamber: null,
    entered: false,
    settings,
    rituals,
    draft: emptyDraft(),
    highlightRole: null,
    lastArtifact: null
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ENTER':
      return { ...state, entered: true, chamber: 'seed', previousChamber: 'threshold' }
    case 'GO':
      if (action.chamber === state.chamber) return state
      return { ...state, previousChamber: state.chamber, chamber: action.chamber }
    case 'SET_SETTINGS': {
      const settings = { ...state.settings, ...action.patch }
      return { ...state, settings }
    }
    case 'SET_DRAFT':
      return { ...state, draft: { ...state.draft, ...action.patch } }
    case 'LOAD_DRAFT':
      return { ...state, draft: { ...action.ritual } }
    case 'RESET_DRAFT':
      return { ...state, draft: emptyDraft() }
    case 'SAVE_RITUAL': {
      const exists = state.rituals.some((r) => r.id === action.ritual.id)
      const rituals = exists
        ? state.rituals.map((r) => (r.id === action.ritual.id ? action.ritual : r))
        : [action.ritual, ...state.rituals]
      return { ...state, rituals }
    }
    case 'DELETE_RITUAL':
      return { ...state, rituals: state.rituals.filter((r) => r.id !== action.id) }
    case 'SET_RITUALS':
      return { ...state, rituals: action.rituals }
    case 'HIGHLIGHT_ROLE':
      return { ...state, highlightRole: action.role }
    case 'SET_ARTIFACT':
      return { ...state, lastArtifact: action.artifact }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  // Persist rituals and settings whenever they change.
  useEffect(() => {
    saveRituals(state.rituals)
  }, [state.rituals])

  useEffect(() => {
    saveSettings(state.settings)
    setGenLayerMock(state.settings.genlayerMock)
  }, [state.settings])

  // Apply theme and motion classes to the document root.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', state.settings.theme)
    if (state.settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [state.settings.theme, state.settings.reducedMotion])

  const go = useCallback((chamber) => dispatch({ type: 'GO', chamber }), [])
  const enter = useCallback(() => dispatch({ type: 'ENTER' }), [])
  const setSettings = useCallback((patch) => dispatch({ type: 'SET_SETTINGS', patch }), [])
  const setDraft = useCallback((patch) => dispatch({ type: 'SET_DRAFT', patch }), [])
  const loadDraft = useCallback((ritual) => dispatch({ type: 'LOAD_DRAFT', ritual }), [])
  const resetDraft = useCallback(() => dispatch({ type: 'RESET_DRAFT' }), [])
  const highlightRole = useCallback((role) => dispatch({ type: 'HIGHLIGHT_ROLE', role }), [])

  const sealRitual = useCallback(() => {
    const draft = state.draft
    const artifact = generateRitualArtifact(draft)
    const sealed = {
      ...draft,
      id: draft.id || artifact.ritualId,
      name: artifact.name,
      createdAt: draft.createdAt || Date.now(),
      sealed: true,
      artifact
    }
    dispatch({ type: 'SAVE_RITUAL', ritual: sealed })
    dispatch({ type: 'SET_ARTIFACT', artifact })
    dispatch({ type: 'LOAD_DRAFT', ritual: sealed })
    return artifact
  }, [state.draft])

  const duplicateRitual = useCallback((ritual) => {
    const copy = {
      ...ritual,
      id: `rit_copy_${Math.random().toString(16).slice(2, 10)}`,
      name: `${ritual.name} (echo)`,
      createdAt: Date.now()
    }
    dispatch({ type: 'SAVE_RITUAL', ritual: copy })
    return copy
  }, [])

  const deleteRitual = useCallback((id) => dispatch({ type: 'DELETE_RITUAL', id }), [])
  const setRituals = useCallback((rituals) => dispatch({ type: 'SET_RITUALS', rituals }), [])

  const importRituals = useCallback(
    (incoming) => {
      const map = new Map(state.rituals.map((r) => [r.id, r]))
      for (const r of incoming) {
        const id = r.id || `rit_import_${Math.random().toString(16).slice(2, 10)}`
        map.set(id, { ...r, id, createdAt: r.createdAt || Date.now() })
      }
      dispatch({ type: 'SET_RITUALS', rituals: Array.from(map.values()) })
    },
    [state.rituals]
  )

  const clearStorage = useCallback(() => {
    clearAll()
    dispatch({ type: 'SET_RITUALS', rituals: [] })
    dispatch({ type: 'SET_SETTINGS', patch: DEFAULT_SETTINGS })
  }, [])

  const value = useMemo(
    () => ({
      state,
      go,
      enter,
      setSettings,
      setDraft,
      loadDraft,
      resetDraft,
      highlightRole,
      sealRitual,
      duplicateRitual,
      deleteRitual,
      setRituals,
      importRituals,
      clearStorage
    }),
    [
      state,
      go,
      enter,
      setSettings,
      setDraft,
      loadDraft,
      resetDraft,
      highlightRole,
      sealRitual,
      duplicateRitual,
      deleteRitual,
      setRituals,
      importRituals,
      clearStorage
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
