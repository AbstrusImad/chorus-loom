// WalletGlyph.jsx
// A discreet wallet/identity control for the studio chrome. Not a loud topbar:
// a single quiet glyph with a soft halo whose color reads the connection state
// (unconnected, connected on Bradbury, connected on the wrong network). Tapping
// it opens a small drifting panel with the short address, a network indicator,
// the faucet link, and connect/disconnect. With no injected provider it shows a
// calm "No wallet detected" state with a MetaMask link, and the studio stays
// usable in mock mode.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWallet, shortAddress, METAMASK_URL } from '../../genlayer/wallet.js'
import { EXPLORER, FAUCET, CONTRACT_ADDRESS, IS_DEPLOYED } from '../../genlayer/genlayerClient.js'

export default function WalletGlyph() {
  const wallet = useWallet()
  const [open, setOpen] = useState(false)

  const connected = Boolean(wallet.address)
  const accent = !connected ? 'ash' : wallet.onChain ? 'sage' : 'crimson'
  const haloVar = connected && wallet.onChain ? 'var(--sage-glow)' : connected ? 'var(--crimson-glow, rgba(200,80,80,0.4))' : 'transparent'

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={connected ? shortAddress(wallet.address) : 'Connect wallet'}
        className="relative flex items-center gap-2 rounded-full pl-3 pr-4 h-10 font-mono text-[11px] tracking-loom uppercase"
        style={{
          background: connected ? 'var(--ink1)' : 'var(--sage)',
          color: connected ? 'var(--bone)' : 'var(--ink0)',
          border: connected ? '1px solid var(--line2)' : '1px solid var(--sage)'
        }}
        whileHover={{ scale: 1.04, boxShadow: `0 0 22px ${connected ? haloVar : 'var(--sage-glow)'}` }}
        whileTap={{ scale: 0.96 }}
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
          style={{
            background: connected ? `var(--${accent})` : 'var(--ink0)',
            boxShadow: connected ? `0 0 12px ${haloVar}` : 'none'
          }}
        />
        <span className="whitespace-nowrap">
          {connected ? shortAddress(wallet.address) : 'Connect Wallet'}
        </span>
        {connected ? (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: `1px solid var(--${accent})` }}
            animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.12, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="rounded-2xl p-4 w-72"
            style={{ background: 'var(--ink1)', border: '1px solid var(--line2)', boxShadow: 'var(--shadow-soft)' }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[10px] tracking-wide-mono uppercase" style={{ color: 'var(--mute)' }}>
              GenLayer identity
            </p>

            {!wallet.hasProvider ? (
              <div className="mt-3">
                <p className="font-body text-sm" style={{ color: 'var(--bone2)' }}>
                  No wallet detected.
                </p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--ash)' }}>
                  Install MetaMask to weave rituals on chain. The studio stays fully usable in mock mode.
                </p>
                <a
                  href={METAMASK_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 font-mono text-[11px] tracking-loom uppercase px-4 py-2 rounded-full"
                  style={{ background: 'var(--sage)', color: 'var(--ink0)' }}
                >
                  Get MetaMask
                </a>
              </div>
            ) : connected ? (
              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <code className="font-mono text-sm" style={{ color: 'var(--bone)' }}>
                    {shortAddress(wallet.address)}
                  </code>
                  <span
                    className="font-mono text-[9px] tracking-wide-mono uppercase px-2 py-1 rounded-full"
                    style={{
                      color: wallet.onChain ? 'var(--sage-text)' : 'var(--crimson-text, var(--bone))',
                      background: 'var(--ink3)',
                      border: `1px solid ${wallet.onChain ? 'var(--sage)' : 'var(--crimson)'}`
                    }}
                  >
                    {wallet.onChain ? 'Bradbury' : 'Wrong network'}
                  </span>
                </div>

                {!wallet.onChain ? (
                  <button
                    type="button"
                    onClick={() => wallet.connect()}
                    className="mt-3 w-full font-mono text-[11px] tracking-loom uppercase px-4 py-2 rounded-full"
                    style={{ background: 'var(--sage)', color: 'var(--ink0)' }}
                  >
                    Switch to Bradbury
                  </button>
                ) : null}

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <a
                    href={FAUCET}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] tracking-wide-mono uppercase px-3 py-1.5 rounded-full"
                    style={{ border: '1px solid var(--line2)', color: 'var(--champagne-text)' }}
                  >
                    Faucet
                  </a>
                  {IS_DEPLOYED ? (
                    <a
                      href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10px] tracking-wide-mono uppercase px-3 py-1.5 rounded-full"
                      style={{ border: '1px solid var(--line2)', color: 'var(--sage-text)' }}
                    >
                      Contract
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      wallet.disconnect()
                      setOpen(false)
                    }}
                    className="font-mono text-[10px] tracking-wide-mono uppercase px-3 py-1.5 rounded-full"
                    style={{ border: '1px solid var(--line2)', color: 'var(--ash)' }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="font-body text-xs" style={{ color: 'var(--ash)' }}>
                  Connect a wallet to seal civic scores on the GenLayer Bradbury testnet. Reading the studio needs no wallet.
                </p>
                <button
                  type="button"
                  onClick={() => wallet.connect()}
                  disabled={wallet.connecting}
                  className="mt-3 w-full font-mono text-[11px] tracking-loom uppercase px-4 py-2 rounded-full disabled:opacity-50"
                  style={{ background: 'var(--sage)', color: 'var(--ink0)' }}
                >
                  {wallet.connecting ? 'Connecting' : 'Connect wallet'}
                </button>
                {wallet.error ? (
                  <p className="font-body text-xs mt-2" style={{ color: 'var(--crimson-text, var(--bone2))' }}>
                    {wallet.error}
                  </p>
                ) : null}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
