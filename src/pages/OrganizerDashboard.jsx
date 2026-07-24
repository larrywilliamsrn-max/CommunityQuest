const stats = [
  { label: 'Participants', value: '184' },
  { label: 'Active Booths', value: '12' },
  { label: 'Most Popular Booth', value: 'AI Lab' },
  { label: 'Average XP', value: '318' },
]

function OrganizerDashboard() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">Organizer control center</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Live event operations</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Create quests, approve participation, and keep momentum high with a live pulse on the crowd.</p>
          </div>
          <button className="rounded-xl bg-[var(--surface-inverted)] px-4 py-2 font-semibold text-white">
            Create New Quest
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-inverted)] p-4 text-white">
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Quest overview</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {['Registration', 'Keynote Attendance', 'Treasure Hunt'].map((item) => (
            <div key={item} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-base)] p-4">
              <p className="font-semibold text-[var(--text-primary)]">{item}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Live progress and approvals stay visible here for quick organizer actions.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default OrganizerDashboard
