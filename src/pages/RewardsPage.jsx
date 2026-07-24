import { useState } from 'react'

const rewards = [
  { id: 1, name: 'Coffee Coupon', cost: 80, description: 'Warm up with a complimentary coffee after the keynote.' },
  { id: 2, name: 'T-Shirt', cost: 160, description: 'Show off your QuestChain streak with a limited tee.' },
  { id: 3, name: 'Headphones', cost: 220, description: 'A premium pair for focus and deep work.' },
]

function RewardsPage() {
  const [tokens, setTokens] = useState(240)
  const [message, setMessage] = useState('Spend your tokens on rewards that feel worth the grind.')

  const handleRedeem = (reward) => {
    if (tokens < reward.cost) {
      setMessage(`Not enough tokens for ${reward.name}.`)
      return
    }

    setTokens((current) => current - reward.cost)
    setMessage(`${reward.name} redeemed`)
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Rewards store</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Redeem your event tokens</h1>
            <p className="mt-2 text-slate-600">Spend your hard-earned tokens on perks that feel like a real payoff.</p>
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
          {rewards.map((reward) => (
            <article key={reward.id} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] p-4">
              <p className="text-lg font-semibold text-[var(--text-primary)]">{reward.name}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{reward.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-[var(--surface-card)] px-3 py-1 text-sm font-semibold text-[var(--text-primary)]">{reward.cost} tokens</span>
                <button
                  type="button"
                  onClick={() => handleRedeem(reward)}
                  className="rounded-xl bg-[var(--surface-inverted)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Redeem {reward.name}
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
