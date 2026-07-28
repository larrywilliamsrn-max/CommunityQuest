import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import { getRewards, redeemReward, getProfile } from '../services/api'

const MOCK_REWARDS = [
  { id: '1', name: 'Coffee Coupon', cost: 80,  description: 'Warm up with a complimentary coffee after the keynote.' },
  { id: '2', name: 'T-Shirt',       cost: 160, description: 'Show off your QuestChain streak with a limited tee.' },
  { id: '3', name: 'Headphones',    cost: 220, description: 'A premium pair for focus and deep work.' },
]

function RewardsPage() {
  const { token } = useContext(AuthContext)

  const [rewards,     setRewards]     = useState([])
  const [tokens,      setTokens]      = useState(240)
  const [message,     setMessage]     = useState('Spend your tokens on rewards that feel worth the grind.')
  const [loading,     setLoading]     = useState(true)
  const [redeemingId, setRedeemingId] = useState(null)

  const isLive = Boolean(token)

  useEffect(() => {
    if (!isLive) {
      setRewards(MOCK_REWARDS)
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([getRewards(), getProfile()])
      .then(([rList, prof]) => {
        setRewards(rList)
        setTokens(prof.tokens || 0)
      })
      .catch(err => {
        console.error('RewardsPage fetch error:', err)
        setRewards(MOCK_REWARDS)
      })
      .finally(() => setLoading(false))
  }, [isLive, token])

  const handleRedeem = async (reward) => {
    if (!isLive) {
      // Demo mode
      if (tokens < reward.cost) {
        setMessage(`Not enough tokens for ${reward.name}.`)
        return
      }
      setTokens(t => t - reward.cost)
      setMessage(`${reward.name} redeemed`)
      return
    }

    setRedeemingId(reward.id)
    try {
      const result = await redeemReward(reward.id)
      setTokens(result.updatedWallet.tokens)
      setMessage(`${reward.name} redeemed successfully!`)
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setRedeemingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--text-secondary)]">
        <p className="animate-pulse text-sm">Loading rewards store…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isLive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Demo mode — connect a wallet on the home screen to redeem with live tokens.
        </div>
      )}

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Rewards store</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Redeem your event tokens</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Spend your hard-earned tokens on perks that feel like a real payoff.</p>
          </div>
          <div className="rounded-xl bg-[var(--surface-card)] border border-[var(--border-default)] px-4 py-3 text-[var(--text-primary)]">
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-secondary)]">Tokens left</p>
            <p className="mt-1 text-2xl font-semibold">{tokens}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Redemption status</p>
        <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{message}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {rewards.length === 0 && (
            <p className="col-span-3 text-sm text-[var(--text-secondary)]">No rewards available right now.</p>
          )}
          {rewards.map((reward) => (
            <article key={reward.id} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] p-4">
              <p className="text-lg font-semibold text-[var(--text-primary)]">{reward.name}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{reward.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-[var(--surface-card)] px-3 py-1 text-sm font-semibold text-[var(--text-primary)]">
                  {reward.cost} tokens
                </span>
                <button
                  id={`redeem-btn-${reward.id}`}
                  type="button"
                  disabled={redeemingId === reward.id || tokens < reward.cost}
                  onClick={() => handleRedeem(reward)}
                  className="rounded-xl bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {redeemingId === reward.id ? 'Redeeming…' : `Redeem ${reward.name}`}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default RewardsPage
