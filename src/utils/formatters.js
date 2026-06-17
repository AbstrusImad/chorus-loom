// formatters.js
// Small presentation helpers shared across chambers.

export function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

// A short qualitative band for a 0..100 score.
export function scoreBand(score) {
  if (score >= 75) return 'high'
  if (score >= 55) return 'good'
  if (score >= 40) return 'medium'
  if (score >= 25) return 'low'
  return 'fragile'
}

export function frictionBand(score) {
  if (score >= 66) return 'high'
  if (score >= 35) return 'medium'
  return 'low'
}

export function severityWeight(severity) {
  if (severity === 'High') return 3
  if (severity === 'Medium') return 2
  return 1
}

// Complexity is a derived measure from steps, roles and layers, 0..100.
export function complexityOf(ritual) {
  const steps = ritual.steps || []
  const roles = ritual.roles || []
  const maxLane = steps.reduce((m, s) => Math.max(m, s.lane || 0), 0)
  const raw = steps.length * 6 + roles.length * 5 + maxLane * 8
  return Math.max(0, Math.min(100, Math.round(raw)))
}

export function formatMeasure(n) {
  return String(n).padStart(2, '0')
}

export function shortDate(ts) {
  if (!ts) return 'unsealed'
  const d = new Date(ts)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function titleToSlug(name) {
  return (name || 'ritual')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}
