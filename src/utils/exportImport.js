// exportImport.js
// Local JSON export and import. No network is involved. Export builds a Blob and
// triggers a download. Import reads a File via FileReader and parses it.

const EXPORT_VERSION = 1

export function exportRitualsToFile(rituals, filename) {
  const payload = {
    app: 'chorus-loom',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    rituals
  }
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'chorus-loom-rituals.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportSingleRitual(ritual) {
  const safe = (ritual.name || 'ritual').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  exportRitualsToFile([ritual], `chorus-loom-${safe}.json`)
}

// Returns a Promise resolving to an array of ritual objects.
export function importRitualsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        let rituals = []
        if (Array.isArray(parsed)) {
          rituals = parsed
        } else if (parsed && Array.isArray(parsed.rituals)) {
          rituals = parsed.rituals
        } else if (parsed && parsed.id) {
          rituals = [parsed]
        } else {
          reject(new Error('The file does not contain a recognizable ritual payload.'))
          return
        }
        resolve(rituals)
      } catch (err) {
        reject(new Error('The file could not be parsed as JSON.'))
      }
    }
    reader.onerror = () => reject(new Error('The file could not be read.'))
    reader.readAsText(file)
  })
}
