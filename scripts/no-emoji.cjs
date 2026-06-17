#!/usr/bin/env node
/*
 * no-emoji.cjs
 * Scans the Chorus Loom source tree for emoji characters and for the em dash
 * character (U+2014). Both are disallowed by the project style rules. Exits with
 * a non zero status code when any offending character is found so the check can
 * gate a build pipeline.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.wrangler'])
const SCAN_EXT = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md', '.py', '.cjs'
])

// Emoji and pictographic ranges. Kept explicit to avoid accidental matches on
// ordinary text. Includes the em dash check separately.
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F0FF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/u
const EM_DASH = '\u2014'

let problems = []

function scanFile(file) {
  const ext = path.extname(file)
  if (!SCAN_EXT.has(ext)) return
  const text = fs.readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  lines.forEach((line, idx) => {
    if (EMOJI_REGEX.test(line)) {
      problems.push(`${file}:${idx + 1} contains an emoji or pictographic character`)
    }
    if (line.includes(EM_DASH)) {
      problems.push(`${file}:${idx + 1} contains an em dash (U+2014)`)
    }
  })
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(path.join(dir, entry.name))
    } else {
      scanFile(path.join(dir, entry.name))
    }
  }
}

walk(ROOT)

if (problems.length > 0) {
  console.error('no-emoji scan FAILED:')
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}

console.log('no-emoji scan passed. No emoji or em dash characters found.')
