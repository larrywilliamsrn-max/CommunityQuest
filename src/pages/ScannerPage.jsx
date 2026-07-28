import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import { getQuests, completeQuest, getProfile } from '../services/api'

// Hard-coded quest ID that maps to the "AI Booth" QR demo
const DEMO_QUEST_ID = 'ai-booth-quest-03'

function ScannerPage() {
  const { token } = useContext(AuthContext)

  const [status,   setStatus]   = useState('Ready to scan a quest QR.')
  const [wallet,   setWallet]   = useState({ xp: 0, tokens: 0, badge: 'Explorer' })
  const [quests,   setQuests]   = useState([])
  const [selected, setSelected] = useState(null)   // quest to complete
  const [scanning, setScanning] = useState(false)

  const isLive = Boolean(token)

  useEffect(() => {
    if (!isLive) {
      setWallet({ xp: 240, tokens: 240, badge: 'Explorer' })
      return
    }

    Promise.all([getQuests(), getProfile()])
      .then(([qsts, prof]) => {
        const activeQuests = qsts.filter(q => q.active)
        setQuests(activeQuests)
        if (activeQuests.length > 0) setSelected(activeQuests[0])
        setWallet({ xp: prof.xp || 0, tokens: prof.tokens || 0, badge: (prof.badges || ['Explorer'])[0] || 'Explorer' })
      })
      .catch(err => console.error('ScannerPage fetch error:', err))
  }, [isLive, token])

  const handleScan = async () => {
    if (!isLive) {
      // Demo mode
      setStatus('Quest scanned successfully')
      setWallet(w => ({ ...w, xp: w.xp + 30, tokens: w.tokens + 20, badge: 'Trailblazer' }))
      return
    }

    if (!selected) {
      setStatus('No active quest selected.')
      return
    }

    setScanning(true)
    setStatus('Processing scan…')
    try {
      const result = await completeQuest(selected.id)
      setStatus(`Quest "${selected.title}" completed! +${result.xp} XP, +${result.tokens} Tokens`)
      setWallet(w => ({
        ...w,
        xp:     result.newTotal.xp,
        tokens: result.newTotal.tokens,
        badge:  result.badges.length > 0 ? result.badges[0] : w.badge,
      }))
      // Remove completed quest from list
      setQuests(q => q.filter(qst => qst.id !== selected.id))
      setSelected(prev => quests.find(q => q.id !== prev?.id) || null)
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="space-y-4">
      {!isLive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — connect a wallet on the home screen to scan real quests.
        </div>
      )}

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">QR scanner</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Scan, confirm, and collect</h1>
            <p className="mt-2 text-[var(--text-secondary)]">
              {isLive ? 'Select an active quest below and scan to earn real rewards.' : 'This MVP uses a mocked scanner experience to show how quests trigger on-chain-style rewards.'}
            </p>
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
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">{isLive ? 'Active Quest' : 'Mock QR View'}</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {isLive ? 'Select a quest then tap Scan Quest.' : 'Point the scanner at an event quest and confirm the reward.'}
              </p>
            </div>
            <button
              id="scan-btn"
              type="button"
              onClick={handleScan}
              disabled={scanning}
              className="rounded-xl bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {scanning ? 'Scanning…' : 'Scan Quest'}
            </button>
          </div>

          {/* Quest selector (live mode) */}
          {isLive && quests.length > 0 && (
            <div className="mt-4 space-y-2">
              {quests.map(q => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelected(q)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected?.id === q.id
                      ? 'border-[var(--semantic-info)] bg-[var(--surface-base)]'
                      : 'border-[var(--border-default)] bg-[var(--surface-base)] hover:border-[var(--semantic-info)]'
                  }`}
                >
                  <p className="font-semibold text-[var(--text-primary)]">{q.title}</p>
                  <p className="text-[var(--text-secondary)]">+{q.xpReward || 0} XP · +{q.tokenReward || 0} Tokens</p>
                </button>
              ))}
            </div>
          )}

          {/* Mock QR placeholder (demo mode) */}
          {(!isLive || quests.length === 0) && (
            <div className="mt-6 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--surface-base)] p-10 text-center text-[var(--text-secondary)]">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-[var(--surface-inverted)] text-2xl font-semibold text-white">
                QR
              </div>
              <p className="mt-4 font-semibold text-[var(--text-primary)]">AI Booth • Quest 03</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Tap to simulate a scan.</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Reward receipt</h2>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {status}
          </div>
          <div className="mt-4 space-y-3">
            <RewardRow label="XP"     value={wallet.xp} />
            <RewardRow label="Tokens" value={wallet.tokens} />
            <RewardRow label="Badge"  value={wallet.badge} />
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
