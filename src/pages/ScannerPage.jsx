import { useState } from 'react'

function ScannerPage() {
  const [status, setStatus] = useState('Ready to scan a quest QR.')
  const [wallet, setWallet] = useState({ xp: 240, tokens: 240, badge: 'Explorer' })

  const handleScan = () => {
    setStatus('Quest scanned successfully')
    setWallet((current) => ({
      ...current,
      xp: current.xp + 30,
      tokens: current.tokens + 20,
      badge: 'Trailblazer',
    }))
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">QR scanner</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Scan, confirm, and collect</h1>
            <p className="mt-2 text-[var(--text-secondary)]">This MVP uses a mocked scanner experience to show how quests trigger on-chain-style rewards.</p>
          </div>
          <div className="rounded-xl bg-[var(--surface-card)] border border-[var(--border-default)] px-4 py-3 text-[var(--text-primary)]">
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-secondary)]">Wallet status</p>
            <p className="mt-1 text-sm font-semibold">{wallet.badge}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Mock QR View</h2>
              <p className="mt-2 text-sm text-slate-500">Point the scanner at an event quest and confirm the reward.</p>
            </div>
            <button
              type="button"
              onClick={handleScan}
              className="rounded-xl bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white"
            >
              Scan Quest
            </button>
          </div>
          <div className="mt-6 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--surface-base)] p-10 text-center text-[var(--text-secondary)]">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-[var(--surface-inverted)] text-2xl font-semibold text-white">
              QR
            </div>
            <p className="mt-4 font-semibold text-[var(--text-primary)]">AI Booth • Quest 03</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Tap to simulate a scan.</p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Reward receipt</h2>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {status}
          </div>
          <div className="mt-4 space-y-3">
            <RewardRow label="XP" value={`+30`} />
            <RewardRow label="Tokens" value={`+20`} />
            <RewardRow label="Wallet" value={wallet.badge} />
          </div>
        </div>
      </section>
    </div>
  )
}

function RewardRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[var(--surface-base)] px-4 py-3 text-sm text-[var(--text-secondary)]">
      <span>{label}</span>
      <span className="font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  )
}

export default ScannerPage
