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
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">QR scanner</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Scan, confirm, and collect</h1>
            <p className="mt-2 text-slate-600">This MVP uses a mocked scanner experience to show how quests trigger on-chain-style rewards.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-fuchsia-500 px-4 py-3 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Wallet status</p>
            <p className="mt-1 text-sm font-semibold">{wallet.badge}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.3)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Mock QR View</h2>
              <p className="mt-2 text-sm text-slate-500">Point the scanner at an event quest and confirm the reward.</p>
            </div>
            <button
              type="button"
              onClick={handleScan}
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Scan Quest
            </button>
          </div>
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-fuchsia-500 text-2xl font-semibold text-white">
              QR
            </div>
            <p className="mt-4 font-semibold text-slate-900">AI Booth • Quest 03</p>
            <p className="mt-2 text-sm text-slate-500">Tap to simulate a scan.</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.3)]">
          <h2 className="text-xl font-semibold text-slate-900">Reward receipt</h2>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
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
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <span>{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  )
}

export default ScannerPage
