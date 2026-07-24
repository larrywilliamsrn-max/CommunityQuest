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
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Rewards store</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Redeem your event tokens</h1>
            <p className="mt-2 text-slate-600">Spend your hard-earned tokens on perks that feel like a real payoff.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-fuchsia-500 px-4 py-3 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Tokens left</p>
            <p className="mt-1 text-2xl font-semibold">{tokens}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.3)]">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Redemption status</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{message}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {rewards.map((reward) => (
            <article key={reward.id} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-lg font-semibold text-slate-900">{reward.name}</p>
              <p className="mt-2 text-sm text-slate-500">{reward.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">{reward.cost} tokens</span>
                <button
                  type="button"
                  onClick={() => handleRedeem(reward)}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
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
