// genlayerClient.js
// The public client surface used by the interface. It wraps the local mock and
// honors a mock mode flag. When mock mode is off the client returns a clearly
// labelled offline response, because Chorus Loom never performs network calls.

import {
  mockCreateRitualRecord,
  mockAnalyzeRitualBalance,
  mockRegisterCivicScore,
  mockGetProof,
  mockGetStatus
} from './mockGenLayer.js'

let mockEnabled = true

export function setGenLayerMock(enabled) {
  mockEnabled = Boolean(enabled)
}

export function isGenLayerMock() {
  return mockEnabled
}

function offline(label) {
  return Promise.resolve({
    status: 'offline',
    note: `GenLayer mock mode is off. ${label} is not performed. Chorus Loom makes no network calls.`
  })
}

export function createRitualRecord(ritual) {
  if (!mockEnabled) return offline('Recording a ritual')
  return mockCreateRitualRecord(ritual)
}

export function analyzeRitualBalance(ritual) {
  if (!mockEnabled) return offline('Balance analysis')
  return mockAnalyzeRitualBalance(ritual)
}

export function registerCivicScore(artifact) {
  if (!mockEnabled) return offline('Civic score registration')
  return mockRegisterCivicScore(artifact)
}

export function getMockProof(ritualId) {
  if (!mockEnabled) return offline('Proof retrieval')
  return mockGetProof(ritualId)
}

export function getGenLayerStatus() {
  if (!mockEnabled) {
    return Promise.resolve({
      network: 'disabled',
      online: false,
      note: 'GenLayer mock mode is off.'
    })
  }
  return mockGetStatus()
}
