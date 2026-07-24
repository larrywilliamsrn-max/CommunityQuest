const stats = [
  { label: 'Participants', value: '184' },
  { label: 'Active Booths', value: '12' },
  { label: 'Most Popular Booth', value: 'AI Lab' },
  { label: 'Average XP', value: '318' },
]

function OrganizerDashboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Organizer control center</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Live event operations</h1>
            <p className="mt-2 text-slate-600">Create quests, approve participation, and keep momentum high with a live pulse on the crowd.</p>
          </div>
          <button className="rounded-2xl bg-gradient-to-r from-blue-600 to-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg">
            Create New Quest
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[24px] border border-slate-100 bg-slate-950 p-4 text-white shadow-lg">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.3)]">
        <h2 className="text-xl font-semibold text-slate-900">Quest overview</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {['Registration', 'Keynote Attendance', 'Treasure Hunt'].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{item}</p>
              <p className="mt-2 text-sm text-slate-500">Live progress and approvals stay visible here for quick organizer actions.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default OrganizerDashboard
