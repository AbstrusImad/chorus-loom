// wallet.js
// A discreet wallet/identity layer for Chorus Loom. It connects through the
// injected provider (MetaMask), adds and switches to the GenLayer Bradbury
// testnet, and keeps a small module level snapshot of the active account so the
// client layer can build a wallet client on demand. A React hook (useWallet)
// subscribes to the snapshot so the chrome can show a quiet glyph and network
// halo. Nothing here blocks the rest of the studio: with no provider the app
// stays usable in mock mode.

import { useEffect, useState } from 'react'

export const BRADBURY_PARAMS = {
  chainId: '0x107D', // 4221
  chainName: 'GenLayer Bradbury Testnet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://rpc-bradbury.genlayer.com'],
  blockExplorerUrls: ['https://explorer-bradbury.genlayer.com/']
}
export const BRADBURY_CHAIN_ID = '0x107d'
export const METAMASK_URL = 'https://metamask.io/download/'

function getEth() {
  if (typeof window === 'undefined') return null
  return window.ethereum || null
}

export function hasProvider() {
  return Boolean(getEth())
}

// ---- module level snapshot ----------------------------------------------

const snapshot = {
  address: null,
  chainId: null,
  connecting: false,
  error: null
}

const listeners = new Set()

function emit() {
  for (const fn of listeners) {
    try {
      fn({ ...snapshot })
    } catch (e) {
      /* ignore listener errors */
    }
  }
}

function setSnapshot(patch) {
  Object.assign(snapshot, patch)
  emit()
}

export function getActiveAccount() {
  return snapshot.address
}

export function isOnBradbury() {
  return String(snapshot.chainId || '').toLowerCase() === BRADBURY_CHAIN_ID
}

// ---- connect / chain management -----------------------------------------

export async function connectWallet() {
  const eth = getEth()
  if (!eth) {
    setSnapshot({ error: 'No wallet detected. Install MetaMask to weave on chain.' })
    return { ok: false, error: 'no-provider' }
  }
  setSnapshot({ connecting: true, error: null })
  try {
    const accounts = await eth.request({ method: 'eth_requestAccounts' })
    if (!accounts || accounts.length === 0) throw new Error('No accounts returned')
    try {
      await eth.request({ method: 'wallet_addEthereumChain', params: [BRADBURY_PARAMS] })
    } catch (e) {
      /* chain may already exist */
    }
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BRADBURY_PARAMS.chainId }]
      })
    } catch (e) {
      /* user may decline the switch */
    }
    let chainId = snapshot.chainId
    try {
      chainId = await eth.request({ method: 'eth_chainId' })
    } catch (e) {
      /* ignore */
    }
    setSnapshot({ address: accounts[0], chainId, connecting: false, error: null })
    return { ok: true, address: accounts[0] }
  } catch (e) {
    const msg = String((e && e.message) || e)
    const friendly = /reject|denied|4001/i.test(msg)
      ? 'You cancelled the connection'
      : 'Could not connect to the wallet'
    setSnapshot({ connecting: false, error: friendly })
    return { ok: false, error: friendly }
  }
}

export function disconnectWallet() {
  setSnapshot({ address: null, error: null })
}

// Attach provider listeners once. Safe to call multiple times.
let listenersAttached = false
export function initWalletWatch() {
  if (listenersAttached) return
  const eth = getEth()
  if (!eth || !eth.on) return
  listenersAttached = true
  eth.on('accountsChanged', (accs) => {
    const next = Array.isArray(accs) && accs.length > 0 ? accs[0] : null
    setSnapshot({ address: next })
  })
  eth.on('chainChanged', (id) => {
    setSnapshot({ chainId: id })
  })
}

// ---- React hook ----------------------------------------------------------

export function useWallet() {
  const [snap, setSnap] = useState({ ...snapshot })

  useEffect(() => {
    initWalletWatch()
    const fn = (next) => setSnap(next)
    listeners.add(fn)
    // Sync immediately in case state changed before subscription.
    setSnap({ ...snapshot })
    return () => {
      listeners.delete(fn)
    }
  }, [])

  return {
    address: snap.address,
    chainId: snap.chainId,
    connecting: snap.connecting,
    error: snap.error,
    hasProvider: hasProvider(),
    onChain: String(snap.chainId || '').toLowerCase() === BRADBURY_CHAIN_ID,
    connect: connectWallet,
    disconnect: disconnectWallet
  }
}

export function shortAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
