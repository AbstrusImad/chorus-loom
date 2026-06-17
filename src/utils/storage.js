// storage.js
// Thin, defensive wrapper over localStorage. Everything in Chorus Loom persists
// locally so a reload keeps the user's rituals and settings. No network.

const RITUALS_KEY = 'chorus-loom:rituals:v1'
const SETTINGS_KEY = 'chorus-loom:settings:v1'
const SEEDED_KEY = 'chorus-loom:seeded:v1'

function safeParse(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (err) {
    return fallback
  }
}

export function loadRituals() {
  return safeParse(localStorage.getItem(RITUALS_KEY), null)
}

export function saveRituals(rituals) {
  try {
    localStorage.setItem(RITUALS_KEY, JSON.stringify(rituals))
  } catch (err) {
    // Storage may be full or unavailable. Fail quietly so the app keeps working.
  }
}

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  animationIntensity: 0.85,
  reducedMotion: false,
  genlayerMock: true,
  density: 'comfortable'
}

export function loadSettings() {
  const stored = safeParse(localStorage.getItem(SETTINGS_KEY), {})
  return { ...DEFAULT_SETTINGS, ...stored }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (err) {
    // ignore
  }
}

export function hasSeeded() {
  return localStorage.getItem(SEEDED_KEY) === 'true'
}

export function markSeeded() {
  try {
    localStorage.setItem(SEEDED_KEY, 'true')
  } catch (err) {
    // ignore
  }
}

export function clearAll() {
  try {
    localStorage.removeItem(RITUALS_KEY)
    localStorage.removeItem(SETTINGS_KEY)
    localStorage.removeItem(SEEDED_KEY)
  } catch (err) {
    // ignore
  }
}
