import { Link, NavLink } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eef2ff,_#f8fafc_55%,_#fdf2f8)] text-slate-800">
      <header className="border-b border-white/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-fuchsia-500 font-semibold text-white shadow-lg">
              QC
            </div>
            <div>
              <p className="text-lg font-semibold">QuestChain</p>
              <p className="text-sm text-slate-500">Gamified event participation</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'text-slate-900' : '')}>
              Dashboard
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => (isActive ? 'text-slate-900' : '')}>
              Event Map
            </NavLink>
            <NavLink to="/rewards" className={({ isActive }) => (isActive ? 'text-slate-900' : '')}>
              Rewards
            </NavLink>
            <NavLink to="/scanner" className={({ isActive }) => (isActive ? 'text-slate-900' : '')}>
              Scanner
            </NavLink>
            <NavLink to="/organizer-experience" className={({ isActive }) => (isActive ? 'text-slate-900' : '')}>
              Organizer
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">{children}</main>
    </div>
  )
}

export default Layout
