import { createContext, useEffect, useMemo, useState } from 'react'
import { loginWithWallet, getMe } from './services/api'

export const AuthContext = createContext({
  role: null,
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [role, setRole]       = useState(null)
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedRole  = localStorage.getItem('questchain-role')
    const storedToken = localStorage.getItem('questchain-token')
    const storedUser  = localStorage.getItem('questchain-user')

    if (storedToken && storedRole) {
      setRole(storedRole)
      setToken(storedToken)
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)) } catch (_) {}
      }

      // Validate the token is still good by fetching /api/auth/me
      getMe()
        .then((fresh) => setUser(fresh))
        .catch(() => {
          // Token expired / invalid — clear everything
          localStorage.removeItem('questchain-role')
          localStorage.removeItem('questchain-token')
          localStorage.removeItem('questchain-user')
          setRole(null)
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  /**
   * login(selectedRole, walletAddress?)
   *
   * If a walletAddress is provided, authenticates against
   * POST /api/auth/login and stores the JWT.
   *
   * Fallback (no wallet): stores the role locally only —
   * pages that need a token will show an "unauthenticated" state.
   */
  const login = async (selectedRole, wallet) => {
    if (wallet) {
      try {
        const data = await loginWithWallet(wallet, selectedRole)
        localStorage.setItem('questchain-token', data.token)
        localStorage.setItem('questchain-role',  data.role)
        localStorage.setItem('questchain-user',  JSON.stringify(data.user))
        setToken(data.token)
        setRole(data.role)
        setUser(data.user)
        return data
      } catch (err) {
        console.error('Login failed:', err.message)
        throw err
      }
    }

    // Role-only login (no wallet) — kept for the demo flow
    setRole(selectedRole)
    localStorage.setItem('questchain-role', selectedRole)
  }

  const logout = () => {
    setRole(null)
    setToken(null)
    setUser(null)
    localStorage.removeItem('questchain-role')
    localStorage.removeItem('questchain-token')
    localStorage.removeItem('questchain-user')
  }

  const value = useMemo(
    () => ({ role, user, token, loading, login, logout }),
    [role, user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
