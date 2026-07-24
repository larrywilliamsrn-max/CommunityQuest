import { useContext } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { House, Sparkle, MapPin, Ticket, QrCode, ShieldCheck, UsersThree, SignOut } from 'phosphor-react'
import { AuthContext } from '../AuthContext'

const guestNav = [
  { label: 'Choose workspace', to: '/', icon: House },
]

const participantNav = [
  { label: 'Quests', to: '/participant', icon: Sparkle },
  { label: 'Event map', to: '/map', icon: MapPin },
  { label: 'Rewards', to: '/rewards', icon: Ticket },
  { label: 'Scanner', to: '/scanner', icon: QrCode },
]

const organizerNav = [
  { label: 'Overview', to: '/organizer', icon: ShieldCheck },
  { label: 'Experience', to: '/organizer-experience', icon: UsersThree },
  { label: 'Event map', to: '/map', icon: MapPin },
]

function Layout({ children }) {
  const { role, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const navItems = role === 'organizer' ? organizerNav : role === 'participant' ? participantNav : guestNav

  const headerLabel = role === 'organizer' ? 'Organizer workspace' : role === 'participant' ? 'Participant workspace' : 'Choose workspace'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const location = useLocation()
  const isChooser = location.pathname === '/'

  return (
    <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
      <div className="lg:flex lg:min-h-screen">
        {!isChooser && (
          <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-[var(--border-default)] bg-[var(--surface-sidebar)] p-4">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-inverted)] text-lg font-semibold text-white">
                  QC
                </div>
                <div>
                  <p className="text-base font-semibold">QuestChain</p>
                  <p className="text-xs text-[var(--text-secondary)]">Event control</p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-[var(--surface-inverted)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)]'}`
                      }
                    >
                      <Icon size={16} weight="bold" className="shrink-0" />
                      {item.label}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
            <div>
              <div className="mb-4 rounded-lg bg-[var(--surface-base)] p-3 text-sm text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)]">Current role</p>
                <p className="mt-1 text-xs">{role ?? 'Guest'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-card)]"
              >
                Logout
              </button>
            </div>
          </aside>
        )}

        <div className="flex-1 bg-[var(--surface-card)]">
          <header className="border-b border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-3 lg:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">{headerLabel}</p>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                  {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} mode` : 'Workspace selection'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden rounded-full bg-[var(--surface-inverted)] px-3 py-1 text-sm font-semibold text-white lg:block">
                  DC
                </div>
                {!isChooser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-1 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <SignOut size={14} weight="bold" />
                    Logout
                  </button>
                )}
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-5 lg:px-5">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default Layout
